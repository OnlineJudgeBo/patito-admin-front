// Export a whole learning path to one YAML file and import it back.
// Stages and topics are matched by key, so ids (and student progress) survive an import.
import yaml from 'js-yaml';

const HEADER = `# Ruta de aprendizaje exportada desde el admin.
# Edita los textos y los problemas, y vuelve a importar este archivo.
# - No cambies las claves (key): con ellas se reconoce cada etapa y tema.
#   Una clave nueva crea un tema nuevo y el tema viejo queda para eliminar.
# - El orden de las etapas y de los temas es el orden en que aparecen aquí.
# - problems son los obligatorios; challenge, los de desafío.
`;

const text = (value) => (typeof value === 'string' ? value : '');
const ids = (value) => (Array.isArray(value) ? value.map(Number) : []);

/** Builds the plain object written to YAML from the admin API response. */
export function pathToDocument(path) {
    const stages = [...path.stages].sort((a, b) => a.sortOrder - b.sortOrder);
    return {
        key: path.track.id,
        title: path.track.title,
        description: text(path.track.description),
        category: text(path.track.category),
        language: text(path.track.languagePrimary),
        slug: text(path.track.slug),
        stages: stages.map(stage => ({
            key: stage.stageKey,
            name: stage.name,
            description: text(stage.description),
            unlocked: Boolean(stage.unlockedByDefault),
            topics: [...stage.topics].sort((a, b) => a.sortOrder - b.sortOrder).map(topic => ({
                key: topic.topicKey,
                title: topic.title,
                summary: text(topic.description),
                difficulty: text(topic.difficulty) || 'basic',
                objectives: topic.skills ?? [],
                problems: ids(topic.recommendedProblems),
                challenge: ids(topic.challengeProblems),
                theory: text(topic.theory).replace(/[ \t]+$/gm, '')   // trailing spaces would force quoted strings
            }))
        }))
    };
}

export function documentToYaml(doc) {
    // Problem id lists read better on one line: problems: [1001, 1002]
    return HEADER + yaml.dump(doc, { lineWidth: -1, noRefs: true })
        .replace(/^( *)(problems|challenge):\n((?:\1 {2}- \d+\n)+)/gm,
            (_, indent, field, items) => `${indent}${field}: [${items.match(/\d+/g).join(', ')}]\n`);
}

/** Parses and validates a YAML file. Returns { doc } or { errors }. */
export function parseDocument(source) {
    let doc;
    try {
        doc = yaml.load(source);
    } catch (error) {
        return { errors: [`El archivo no es YAML válido: ${error.message}`] };
    }
    const errors = [];
    if (!doc || typeof doc !== 'object') return { errors: ['El archivo está vacío.'] };
    if (!text(doc.key).trim()) errors.push('Falta la clave de la ruta (key).');
    if (!text(doc.title).trim()) errors.push('Falta el título de la ruta (title).');
    if (!Array.isArray(doc.stages)) errors.push('Falta la lista de etapas (stages).');
    const stageKeys = new Set();
    (Array.isArray(doc.stages) ? doc.stages : []).forEach((stage, i) => {
        const where = `Etapa ${i + 1}`;
        if (!text(stage?.key).trim()) errors.push(`${where}: falta key.`);
        else if (stageKeys.has(stage.key)) errors.push(`${where}: la clave ${stage.key} está repetida.`);
        stageKeys.add(stage?.key);
        if (!text(stage?.name).trim()) errors.push(`${where}: falta name.`);
        const topicKeys = new Set();
        (Array.isArray(stage?.topics) ? stage.topics : []).forEach((topic, j) => {
            const at = `${where}, tema ${j + 1}`;
            if (!text(topic?.key).trim()) errors.push(`${at}: falta key.`);
            else if (topicKeys.has(topic.key)) errors.push(`${at}: la clave ${topic.key} está repetida en la etapa.`);
            topicKeys.add(topic?.key);
            if (!text(topic?.title).trim()) errors.push(`${at}: falta title.`);
            for (const field of ['problems', 'challenge']) {
                const list = topic?.[field] ?? [];
                if (!Array.isArray(list) || list.some(id => !Number.isInteger(id) || id <= 0))
                    errors.push(`${at}: ${field} debe ser una lista de IDs, por ejemplo [1001, 1002].`);
            }
        });
    });
    return errors.length ? { errors } : { doc };
}

const pathBody = (doc, version) => ({
    key: doc.key, title: doc.title, description: text(doc.description), version: version || 1,
    languagePrimary: text(doc.language), category: text(doc.category), slug: text(doc.slug) || null
});
const stageBody = (stage, order) => ({
    key: stage.key, name: stage.name, description: text(stage.description), order, unlockedByDefault: Boolean(stage.unlocked)
});
const topicBody = (topic, order) => ({
    key: topic.key, title: topic.title, summary: text(topic.summary), difficulty: text(topic.difficulty) || 'basic', order,
    learningObjectives: (topic.objectives ?? []).map(String), theory: text(topic.theory),
    problemIds: topic.problems ?? [], challengeProblemIds: topic.challenge ?? []
});

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const trimEnd = (value) => text(value).replace(/\s+$/, '');

/**
 * Compares the file with what is saved. `path` is the admin response, or null when the path does not exist yet.
 * Returns the changes to apply, in order, plus what exists only in the database (offered for deletion).
 */
export function planImport(path, doc) {
    const current = path ? pathToDocument(path) : null;
    const savedStages = new Map((path?.stages ?? []).map(stage => [stage.stageKey, stage]));
    const changes = [];

    if (!current) changes.push({ kind: 'path-create', label: `Crear la ruta ${doc.title}`, body: pathBody(doc) });
    else if (!same(pathBody(current), pathBody(doc))) changes.push({ kind: 'path-update', label: 'Datos de la ruta', body: pathBody(doc, path.track.version) });

    doc.stages.forEach((stage, i) => {
        const order = i + 1;
        const saved = savedStages.get(stage.key);
        const savedDoc = current?.stages.find(item => item.key === stage.key);
        if (!saved) changes.push({ kind: 'stage-create', label: `Nueva etapa: ${stage.name}`, stageKey: stage.key, body: stageBody(stage, order) });
        else if (saved.sortOrder !== order || !same(stageBody(savedDoc, order), stageBody(stage, order)))
            changes.push({ kind: 'stage-update', label: `Etapa: ${stage.name}`, stageId: saved.stageId, body: stageBody(stage, order), reorder: saved.sortOrder !== order });

        (stage.topics ?? []).forEach((topic, j) => {
            const savedTopic = saved?.topics.find(item => item.topicKey === topic.key);
            const body = topicBody(topic, j + 1);
            if (!savedTopic) changes.push({ kind: 'topic-create', label: `Nuevo tema: ${topic.title}`, stageKey: stage.key, body });
            else {
                const before = topicBody(savedDoc.topics.find(item => item.key === topic.key), savedTopic.sortOrder);
                if (!same({ ...before, theory: trimEnd(before.theory) }, { ...body, theory: trimEnd(body.theory) }))
                    changes.push({ kind: 'topic-update', label: `Tema: ${topic.title}`, stageKey: stage.key, topicId: savedTopic.topicId, body });
            }
        });
    });

    const fileStages = new Map(doc.stages.map(stage => [stage.key, stage]));
    const deletions = [];
    for (const stage of path?.stages ?? []) {
        const fileStage = fileStages.get(stage.stageKey);
        if (!fileStage) {
            const keep = stageBody(current.stages.find(item => item.key === stage.stageKey), stage.sortOrder);
            deletions.push({ kind: 'stage-delete', label: `Etapa: ${stage.name} (con sus ${stage.topics.length} temas)`, stageId: stage.stageId, id: `s${stage.stageId}`, keep });
            continue;
        }
        const fileTopicKeys = new Set((fileStage.topics ?? []).map(topic => topic.key));
        stage.topics.filter(topic => !fileTopicKeys.has(topic.topicKey)).forEach(topic =>
            deletions.push({ kind: 'topic-delete', label: `Tema: ${topic.title}`, stageId: stage.stageId, topicId: topic.topicId, id: `t${topic.topicId}` }));
    }
    return { changes, deletions };
}

/**
 * Applies a plan with the admin API, one request at a time. Stops at the first error;
 * importing the same file again resumes, because finished changes no longer show up in the plan.
 */
export async function applyImport(api, pathKey, plan, deletionIds, onStep = () => undefined) {
    const stageIds = new Map();
    let key = pathKey;
    const step = async (label, request) => {
        onStep(label);
        try {
            return await request();
        } catch (error) {
            error.importStep = label;
            throw error;
        }
    };

    for (const deletion of plan.deletions.filter(item => deletionIds.has(item.id))) {
        if (deletion.kind === 'stage-delete') await step(`Eliminar ${deletion.label}`, () => api.deleteAcademicLearningPathStage(key, deletion.stageId));
        else await step(`Eliminar ${deletion.label}`, () => api.deleteAcademicLearningPathTopic(key, deletion.stageId, deletion.topicId));
    }

    const pathChange = plan.changes.find(change => change.kind.startsWith('path-'));
    if (pathChange?.kind === 'path-create') key = (await step(pathChange.label, () => api.createAcademicLearningPath(pathChange.body))).track.id;
    if (pathChange?.kind === 'path-update') await step(pathChange.label, () => api.updateAcademicLearningPath(key, pathChange.body));

    // Stage order is unique per path: park reordered stages on free numbers before giving them their final place.
    // Stages kept in the database but missing from the file go to the end, so they never block a new order.
    const kept = plan.deletions.filter(item => item.kind === 'stage-delete' && !deletionIds.has(item.id));
    for (const [i, item] of kept.entries())
        await step(`Mover al final ${item.label}`, () => api.updateAcademicLearningPathStage(key, item.stageId, { ...item.keep, order: 20000 + i }));
    const reordered = plan.changes.filter(change => change.reorder);
    for (const [i, change] of reordered.entries())
        await step(`Ordenar ${change.label}`, () => api.updateAcademicLearningPathStage(key, change.stageId, { ...change.body, order: 10000 + i }));

    for (const change of plan.changes) {
        if (change.kind === 'stage-create') {
            const response = await step(change.label, () => api.createAcademicLearningPathStage(key, change.body));
            stageIds.set(change.stageKey, response.stages.find(stage => stage.stageKey === change.body.key)?.stageId);
        } else if (change.kind === 'stage-update') {
            await step(change.label, () => api.updateAcademicLearningPathStage(key, change.stageId, change.body));
        } else if (change.kind === 'topic-create' || change.kind === 'topic-update') {
            const stageId = change.kind === 'topic-update' || !stageIds.has(change.stageKey)
                ? await findStageId(api, key, change.stageKey, stageIds)
                : stageIds.get(change.stageKey);
            if (change.kind === 'topic-create') await step(change.label, () => api.createAcademicLearningPathTopic(key, stageId, change.body));
            else await step(change.label, () => api.updateAcademicLearningPathTopic(key, stageId, change.topicId, change.body));
        }
    }
    return key;
}

async function findStageId(api, key, stageKey, cache) {
    if (!cache.has(stageKey)) {
        const path = await api.fetchManagedLearningPath(key);
        path.stages.forEach(stage => cache.set(stage.stageKey, stage.stageId));
    }
    return cache.get(stageKey);
}

export function exportLearningPath(path) {
    downloadText(`${path.track.id}.yml`, documentToYaml(pathToDocument(path)));
}

function downloadText(fileName, content) {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/yaml;charset=utf-8' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
    link.click();
    URL.revokeObjectURL(url);
}
