// Checks a problem .zip in the browser before uploading it, mirroring what the API importers require.

// File names inside a .zip, read from its central directory (no extraction).
// ponytail: no ZIP64 (over 4 GB or 65535 entries); the API caps uploads at 200 MB anyway.
export async function listZipEntries(file) {
    const tailSize = Math.min(file.size, 65557);
    const tail = new DataView(await file.slice(file.size - tailSize).arrayBuffer());
    let end = -1;
    for (let i = tailSize - 22; i >= 0; i--) {
        if (tail.getUint32(i, true) === 0x06054b50) {
            end = i;
            break;
        }
    }
    if (end < 0) {
        throw new Error('No es un .zip válido.');
    }

    const count = tail.getUint16(end + 10, true);
    const size = tail.getUint32(end + 12, true);
    const offset = tail.getUint32(end + 16, true);
    const directory = new DataView(await file.slice(offset, offset + size).arrayBuffer());
    const decoder = new TextDecoder();
    const names = [];
    for (let at = 0, i = 0; i < count; i++) {
        if (at + 46 > directory.byteLength || directory.getUint32(at, true) !== 0x02014b50) {
            throw new Error('El .zip está dañado.');
        }
        const nameLength = directory.getUint16(at + 28, true);
        const name = decoder.decode(new Uint8Array(directory.buffer, at + 46, nameLength));
        names.push(name.replace(/\\/g, '/'));
        at += 46 + nameLength + directory.getUint16(at + 30, true) + directory.getUint16(at + 32, true);
    }
    return names;
}

// Folder of the shallowest entry with this file name ('' at the root), like the API's Find; null when missing.
function findRoot(names, fileName) {
    const matches = names.filter((name) => name === fileName || name.endsWith(`/${fileName}`));
    if (matches.length === 0) {
        return null;
    }
    const shortest = matches.reduce((best, name) => (name.length < best.length ? name : best));
    return shortest.slice(0, shortest.length - fileName.length);
}

// Problems found for this format ('cms', 'tps' or undefined for this judge's own package); empty when it looks fine.
export function checkProblemZip(names, format) {
    const has = (path) => names.includes(path);
    const hasFolder = (path) => names.some((name) => name.startsWith(path));
    const cms = findRoot(names, 'task.yaml');
    const tps = findRoot(names, 'problem.json');

    if (format === 'cms') {
        if (cms === null) {
            return [tps !== null ? 'Es una tarea de TPS: impórtala desde "Importar de TPS".' : 'Falta task.yaml.'];
        }
        const problems = [];
        if (!has(`${cms}input/input0.txt`) || !has(`${cms}output/output0.txt`)) {
            problems.push('Faltan los casos: input/input0.txt y output/output0.txt.');
        }
        if (!has(`${cms}check/checker.cpp`) && !has(`${cms}cor/correttore.cpp`) && (has(`${cms}check/checker`) || has(`${cms}cor/correttore`))) {
            problems.push('El checker solo está como binario; incluye check/checker.cpp.');
        }
        return problems;
    }

    if (format === 'tps') {
        if (tps === null) {
            return [cms !== null ? 'Es una tarea de CMS: impórtala desde "Importar de CMS".' : 'Falta problem.json.'];
        }
        if (cms !== null) {
            return ['Tiene task.yaml: el juez la importaría como CMS. Impórtala desde "Importar de CMS".'];
        }
        if (!hasFolder(`${tps}subtasks/`) && !has(`${tps}tests/mapping`)) {
            return ['Falta tests/mapping: ejecuta "tps gen" antes de comprimir la tarea.'];
        }
        return [];
    }

    if (has('problem.yaml') || has('metadata.json')) {
        return [];
    }
    if (cms !== null || tps !== null) {
        return [`Es una tarea de ${cms !== null ? 'CMS' : 'TPS'}: impórtala desde "Importar de ${cms !== null ? 'CMS' : 'TPS'}".`];
    }
    return ['No es un paquete de este juez: falta problem.yaml o metadata.json en la raíz del .zip.'];
}
