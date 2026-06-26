/* eslint-disable react/prop-types, react-hooks/exhaustive-deps */
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CKEditor as BaseCKEditor } from '@ckeditor/ckeditor5-react';
import { useEffect, useRef, useState } from 'react';

const LATEX_TEMPLATE_GROUPS = [
    {
        id: 'basicas',
        label: 'Básicas',
        templates: [
            { label: 'Fracción', value: '\\frac{a}{b}' },
            { label: 'Raíz', value: '\\sqrt{x}' },
            { label: 'Potencia', value: 'x^{k}' },
            { label: 'Subíndice', value: 'a_i' },
            { label: 'Valor absoluto', value: '|x - y|' },
            { label: 'Lista', value: 'x_1, x_2, \\ldots, x_n' }
        ]
    },
    {
        id: 'restricciones',
        label: 'Restricciones',
        templates: [
            { label: 'Rango n', value: '1 \\le n \\le 10^5' },
            { label: 'Rango arreglo', value: '0 \\le a_i \\le 10^9' },
            { label: 'Restricciones', value: '\\begin{aligned}\n1 \\le n \\le 2 \\cdot 10^5 \\\\\n0 \\le a_i \\le 10^9\n\\end{aligned}', block: true },
            { label: 'Múltiples casos', value: '1 \\le t \\le 10^4' }
        ]
    },
    {
        id: 'sumatorias',
        label: 'Sumas/productos',
        templates: [
            { label: 'Sumatoria', value: '\\sum_{i=1}^{n} a_i' },
            { label: 'Producto', value: '\\prod_{i=1}^{n} a_i' },
            { label: 'Máximo/Mínimo', value: '\\max_{1 \\le i \\le n} a_i' },
            { label: 'Casos', value: 'f(x) = \\begin{cases}\nx^2 & x \\ge 0 \\\\\n-x & x < 0\n\\end{cases}', block: true }
        ]
    },
    {
        id: 'programacion',
        label: 'Programación',
        templates: [
            { label: 'O(n)', value: '\\mathcal{O}(n)' },
            { label: 'O(n log n)', value: '\\mathcal{O}(n \\log n)' },
            { label: 'O(n²)', value: '\\mathcal{O}(n^2)' },
            { label: 'DP', value: 'dp[i][j]' },
            { label: 'Distancia', value: 'dist[u]' }
        ]
    },
    {
        id: 'numeros',
        label: 'Números',
        templates: [
            { label: 'Módulo', value: 'a \\bmod m' },
            { label: 'Congruencia', value: 'a \\equiv b \\pmod m' },
            { label: 'MCD', value: '\\gcd(a, b)' },
            { label: 'Combinatoria', value: '\\binom{n}{k}' }
        ]
    },
    {
        id: 'conjuntos',
        label: 'Conjuntos/prob.',
        templates: [
            { label: 'Conjunto', value: 'S = \\{x \\mid 0 \\le x < n\\}' },
            { label: 'Unión', value: 'A \\cup B' },
            { label: 'Intersección', value: 'A \\cap B' },
            { label: 'Probabilidad', value: '\\Pr(A) = \\frac{|A|}{|\\Omega|}' },
            { label: 'Matriz', value: 'A \\in \\mathbb{Z}^{n \\times m}' }
        ]
    }
];

function normalizeLatex(value) {
    return value
        .replace(/\\;/g, ' ')
        .replace(/\\,/g, ' ')
        .replace(/\\\{/g, '{')
        .replace(/\\\}/g, '}')
        .replace(/\\_/g, '_')
        .replace(/\\leq?/g, '≤')
        .replace(/\\geq?/g, '≥')
        .replace(/\\neq?/g, '≠')
        .replace(/\\times/g, '×')
        .replace(/\\cdot/g, '·')
        .replace(/\\to/g, '→')
        .replace(/\\infty/g, '∞')
        .replace(/\\ldots/g, '…')
        .replace(/\\sum/g, '∑')
        .replace(/\\prod/g, '∏')
        .replace(/\\sqrt/g, '√')
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1 / $2')
        .replace(/\s+/g, ' ')
        .trim();
}

export function MathStatementEditor({ data = '', onChange, ...props }) {
    const [mode, setMode] = useState('editor');
    const [formula, setFormula] = useState('');
    const [displayFormula, setDisplayFormula] = useState(false);
    const [latexDialogOpen, setLatexDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(LATEX_TEMPLATE_GROUPS[0].id);
    const editorRef = useRef(null);
    const update = (value) => onChange?.(null, { getData: () => value });
    const currentTemplates = LATEX_TEMPLATE_GROUPS.find((group) => group.id === selectedCategory)?.templates || LATEX_TEMPLATE_GROUPS[0].templates;
    const normalizedFormula = formula.trim();
    const previewMarkup = normalizedFormula ? (displayFormula ? `\\[${normalizedFormula}\\]` : `\\(${normalizedFormula}\\)`) : '';

    const chooseTemplate = (template) => {
        setFormula(template.value);
        setDisplayFormula(Boolean(template.block));
    };

    const convertBlockToInline = () => {
        setFormula((value) => value.trim().replace(/^\\\[([\s\S]*)\\\]$/, '$1').trim());
        setDisplayFormula(false);
    };

    const addToolbarButton = (editor, id, label, title, icon, onClick) => {
        const toolbarElement = editor.ui.view.toolbar.element;
        const toolbarItems = toolbarElement?.querySelector('.ck-toolbar__items') ?? toolbarElement;

        if (!toolbarItems || toolbarItems.querySelector(`[data-problem-editor-action="${id}"]`)) {
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ck ck-button';
        button.dataset.problemEditorAction = id;
        button.title = title;
        button.setAttribute('aria-label', title);
        button.innerHTML = `
            <span class="problem-editor-toolbar-icon" aria-hidden="true">${icon}</span>
            <span class="ck-button__label">${label}</span>
        `;
        button.addEventListener('click', (event) => {
            event.preventDefault();
            onClick();
        });
        toolbarItems.insertBefore(button, toolbarItems.firstChild);
    };

    const insertFormula = () => {
        if (!normalizedFormula) {
            return;
        }

        const latexMarkup = displayFormula ? `\\[${normalizedFormula}\\]` : `\\(${normalizedFormula}\\)`;
        const editor = editorRef.current;

        if (editor && mode === 'editor') {
            editor.model.change((writer) => {
                editor.model.insertContent(writer.createText(` ${latexMarkup} `));
            });
            update(editor.getData());
            editor.editing.view.focus();
        } else {
            update(`${data} ${latexMarkup} `);
        }

        setFormula('');
        setDisplayFormula(false);
        setLatexDialogOpen(false);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'm') {
                event.preventDefault();
                setLatexDialogOpen(true);
                return;
            }

            if (!latexDialogOpen) {
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                insertFormula();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [latexDialogOpen, normalizedFormula, displayFormula, mode, data]);

    return (
        <section className="rich-editor space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            {mode === 'source' ? (
                <div className="flex items-center border-b border-slate-200 pb-3 text-sm">
                    <button
                        type="button"
                        onClick={() => setMode('editor')}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        ← Volver al editor
                    </button>
                </div>
            ) : null}

            {mode === 'editor' ? (
                <BaseCKEditor
                    {...props}
                    data={data}
                    onReady={(editor) => {
                        editorRef.current = editor;
                        props.onReady?.(editor);
                        const addToolbarActions = () => {
                            addToolbarButton(editor, 'html', 'HTML', 'Editar HTML', '&lt;/&gt;', () => setMode('source'));
                            addToolbarButton(editor, 'latex', 'Lₓ', 'Abrir Equation Editor', '∑', () => setLatexDialogOpen(true));
                        };

                        window.requestAnimationFrame(addToolbarActions);
                        window.setTimeout(addToolbarActions, 100);
                    }}
                    onChange={onChange}
                />
            ) : null}

            {mode === 'source' ? (
                <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">HTML</h3>
                        <p className="text-xs text-slate-500">Edita el marcado directamente; los cambios se conservan al volver al editor visual.</p>
                    </div>
                    <textarea
                        className="min-h-56 w-full rounded-lg border border-slate-300 bg-slate-950 p-3 font-mono text-sm text-slate-100 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        value={data}
                        onChange={(event) => update(event.target.value)}
                        aria-label="Código HTML"
                    />
                </div>
            ) : null}

            <Dialog open={latexDialogOpen} onOpenChange={setLatexDialogOpen}>
                <DialogContent className="max-w-4xl bg-white">
                    <DialogHeader>
                        <DialogTitle>Equation Editor</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {LATEX_TEMPLATE_GROUPS.map((group) => (
                                    <button
                                        key={group.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(group.id)}
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${selectedCategory === group.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
                                    >
                                        {group.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {currentTemplates.map((template) => (
                                    <button key={`${selectedCategory}-${template.label}`} type="button" onClick={() => chooseTemplate(template)} className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50">
                                        {template.label}
                                    </button>
                                ))}
                            </div>

                            <textarea value={formula} onChange={(event) => setFormula(event.target.value)} className="min-h-40 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder={'\\frac{a}{b} + x^2'} aria-label="Fórmula LaTeX" />

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                                <label className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1">
                                    <input type="radio" checked={!displayFormula} onChange={() => setDisplayFormula(false)} />
                                    Insertar en la misma línea
                                </label>
                                <label className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1">
                                    <input type="radio" checked={displayFormula} onChange={() => setDisplayFormula(true)} />
                                    Insertar como bloque centrado
                                </label>
                                <button type="button" onClick={convertBlockToInline} className="rounded-md border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50">
                                    Convertir a inline
                                </button>
                            </div>
                        </div>

                        <aside className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">Vista previa</h3>
                                <div className={`mt-2 rounded-lg border border-slate-200 bg-white p-3 font-serif text-slate-900 ${displayFormula ? 'text-center' : ''}`}>
                                    {normalizedFormula ? normalizeLatex(normalizedFormula) : <span className="text-sm text-slate-400">Escribe o elige una fórmula.</span>}
                                </div>
                                {previewMarkup ? <code className="mt-2 block break-all rounded bg-slate-900 p-2 text-xs text-slate-100">{previewMarkup}</code> : null}
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                                <ul className="space-y-1">
                                    <li><code>\(x^2\)</code> se queda en la misma línea.</li>
                                    <li><code>\[x^2\]</code> crea un bloque centrado.</li>
                                    <li><code>a_i</code> crea subíndice.</li>
                                    <li><code>x^2</code> crea potencia.</li>
                                    <li><code>\frac{'{a}'}{'{b}'}</code> crea fracción.</li>
                                </ul>
                            </div>
                        </aside>
                    </div>

                    <DialogFooter>
                        <Button type="button" onClick={insertFormula} disabled={!normalizedFormula}>Insertar en el editor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
