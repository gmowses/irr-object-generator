import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, FileCode2, Copy, CheckCircle2 } from 'lucide-react'

const translations = {
  en: {
    title: 'IRR Object Generator',
    subtitle: 'Generate IRR (Internet Routing Registry) objects in RPSL format: aut-num, route/route6, and as-set. Ready to submit to RADB, RIPE, or ARIN.',
    objectType: 'Object Type',
    types: { autnum: 'aut-num (ASN Policy)', route: 'route (IPv4 Prefix)', route6: 'route6 (IPv6 Prefix)', asset: 'as-set (ASN Group)' },
    fields: {
      asn: 'ASN (without AS prefix)',
      asnDesc: 'AS Description',
      importFrom: 'Import from AS (e.g. AS65001)',
      importAction: 'Import action',
      exportTo: 'Export to AS (e.g. AS65001)',
      exportAction: 'Export action',
      prefix: 'Prefix (IPv4)',
      prefix6: 'Prefix (IPv6)',
      originAs: 'Origin AS (e.g. AS65000)',
      setName: 'Set Name (e.g. AS65000:AS-CUSTOMERS)',
      members: 'Members (comma-separated, e.g. AS65001,AS65002)',
      mntner: 'Maintainer (MNTNER)',
      adminC: 'Admin Contact',
      techC: 'Tech Contact',
      source: 'Registry Source',
      descr: 'Description',
    },
    sources: ['RADB', 'RIPE', 'ARIN', 'APNIC', 'LACNIC', 'AFRINIC', 'TC', 'ALTDB'],
    generate: 'Generate RPSL',
    output: 'RPSL Output',
    copy: 'Copy',
    copied: 'Copied!',
    note: 'Submit this object to your IRR via email to db@radb.net or via the registry web portal.',
    builtBy: 'Built by',
    references: 'References',
    refList: [
      'RFC 2622 – Routing Policy Specification Language (RPSL)',
      'RFC 2650 – Using RPSL in Practice',
      'RFC 4012 – Routing Policy Specification Language next generation (RPSLng)',
    ],
  },
  pt: {
    title: 'Gerador de Objetos IRR',
    subtitle: 'Gere objetos IRR (Internet Routing Registry) no formato RPSL: aut-num, route/route6 e as-set. Pronto para enviar ao RADB, RIPE ou ARIN.',
    objectType: 'Tipo de Objeto',
    types: { autnum: 'aut-num (Politica ASN)', route: 'route (Prefixo IPv4)', route6: 'route6 (Prefixo IPv6)', asset: 'as-set (Grupo ASN)' },
    fields: {
      asn: 'ASN (sem prefixo AS)',
      asnDesc: 'Descricao do AS',
      importFrom: 'Importar de AS (ex: AS65001)',
      importAction: 'Acao de importacao',
      exportTo: 'Exportar para AS (ex: AS65001)',
      exportAction: 'Acao de exportacao',
      prefix: 'Prefixo (IPv4)',
      prefix6: 'Prefixo (IPv6)',
      originAs: 'AS de Origem (ex: AS65000)',
      setName: 'Nome do Conjunto (ex: AS65000:AS-CLIENTES)',
      members: 'Membros (separados por virgula, ex: AS65001,AS65002)',
      mntner: 'Mantenedor (MNTNER)',
      adminC: 'Contato Administrativo',
      techC: 'Contato Tecnico',
      source: 'Registro de Origem',
      descr: 'Descricao',
    },
    sources: ['RADB', 'RIPE', 'ARIN', 'APNIC', 'LACNIC', 'AFRINIC', 'TC', 'ALTDB'],
    generate: 'Gerar RPSL',
    output: 'Saida RPSL',
    copy: 'Copiar',
    copied: 'Copiado!',
    note: 'Envie este objeto para o seu IRR por email para db@radb.net ou pelo portal web do registro.',
    builtBy: 'Criado por',
    references: 'Referencias',
    refList: [
      'RFC 2622 – Routing Policy Specification Language (RPSL)',
      'RFC 2650 – Usando RPSL na Pratica',
      'RFC 4012 – RPSLng – Proxima geracao do RPSL',
    ],
  },
} as const

type Lang = keyof typeof translations
type ObjType = keyof typeof translations.en.types

function generateAutnum(f: Record<string, string>): string {
  return `aut-num:     AS${f.asn}
as-name:     ${f.asnDesc || `AS${f.asn}-NETWORK`}
descr:       ${f.descr || `AS${f.asn} Network`}
import:      from ${f.importFrom || 'AS65001'} accept ${f.importAction || 'ANY'}
export:      to ${f.exportTo || 'AS65001'} announce ${f.exportAction || `AS${f.asn}`}
admin-c:     ${f.adminC || 'ADMIN-HANDLE'}
tech-c:      ${f.techC || 'TECH-HANDLE'}
mnt-by:      ${f.mntner || 'MNT-EXAMPLE'}
source:      ${f.source || 'RADB'}
changed:     hostmaster@example.com ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}
`
}

function generateRoute(f: Record<string, string>): string {
  return `route:       ${f.prefix || '192.0.2.0/24'}
descr:       ${f.descr || 'Route for ' + (f.prefix || '192.0.2.0/24')}
origin:      ${f.originAs || 'AS65000'}
admin-c:     ${f.adminC || 'ADMIN-HANDLE'}
tech-c:      ${f.techC || 'TECH-HANDLE'}
mnt-by:      ${f.mntner || 'MNT-EXAMPLE'}
source:      ${f.source || 'RADB'}
changed:     hostmaster@example.com ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}
`
}

function generateRoute6(f: Record<string, string>): string {
  return `route6:      ${f.prefix6 || '2001:db8::/32'}
descr:       ${f.descr || 'IPv6 Route for ' + (f.prefix6 || '2001:db8::/32')}
origin:      ${f.originAs || 'AS65000'}
admin-c:     ${f.adminC || 'ADMIN-HANDLE'}
tech-c:      ${f.techC || 'TECH-HANDLE'}
mnt-by:      ${f.mntner || 'MNT-EXAMPLE'}
source:      ${f.source || 'RADB'}
changed:     hostmaster@example.com ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}
`
}

function generateAsset(f: Record<string, string>): string {
  const members = (f.members || 'AS65001,AS65002').split(',').map(s => s.trim()).filter(Boolean)
  return `as-set:      ${f.setName || 'AS65000:AS-CUSTOMERS'}
descr:       ${f.descr || 'Customer AS set'}
members:     ${members.join(', ')}
admin-c:     ${f.adminC || 'ADMIN-HANDLE'}
tech-c:      ${f.techC || 'TECH-HANDLE'}
mnt-by:      ${f.mntner || 'MNT-EXAMPLE'}
source:      ${f.source || 'RADB'}
changed:     hostmaster@example.com ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}
`
}

export default function IrrObjectGenerator() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [objType, setObjType] = useState<ObjType>('autnum')
  const [fields, setFields] = useState<Record<string, string>>({ asn: '65000', mntner: 'MNT-EXAMPLE', source: 'RADB', adminC: 'ADMIN-HANDLE', techC: 'TECH-HANDLE' })
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }))

  const generate = () => {
    let rpsl = ''
    if (objType === 'autnum') rpsl = generateAutnum(fields)
    else if (objType === 'route') rpsl = generateRoute(fields)
    else if (objType === 'route6') rpsl = generateRoute6(fields)
    else rpsl = generateAsset(fields)
    setOutput(rpsl)
  }

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const inputCls = 'rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full'
  const labelCls = 'text-xs text-zinc-500 block mb-1'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <FileCode2 size={18} className="text-white" />
            </div>
            <span className="font-semibold">IRR Object Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/irr-object-generator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6">
            {/* Object type */}
            <div>
              <label className={labelCls}>{t.objectType}</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(t.types) as ObjType[]).map(k => (
                  <button key={k} onClick={() => setObjType(k)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={objType === k ? { backgroundColor: '#0d9488', color: 'white' } : { border: '1px solid rgb(228 228 231)', color: 'rgb(113 113 122)' }}>
                    {t.types[k]}
                  </button>
                ))}
              </div>
            </div>

            {/* Common fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              {objType === 'autnum' && <>
                <div>
                  <label className={labelCls}>{t.fields.asn}</label>
                  <input value={fields.asn ?? ''} onChange={e => set('asn', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.fields.asnDesc}</label>
                  <input value={fields.asnDesc ?? ''} onChange={e => set('asnDesc', e.target.value)} placeholder="MY-NETWORK" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.fields.importFrom}</label>
                  <input value={fields.importFrom ?? ''} onChange={e => set('importFrom', e.target.value)} placeholder="AS65001" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.fields.importAction}</label>
                  <input value={fields.importAction ?? ''} onChange={e => set('importAction', e.target.value)} placeholder="ANY" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.fields.exportTo}</label>
                  <input value={fields.exportTo ?? ''} onChange={e => set('exportTo', e.target.value)} placeholder="AS65001" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.fields.exportAction}</label>
                  <input value={fields.exportAction ?? ''} onChange={e => set('exportAction', e.target.value)} placeholder="AS65000" className={inputCls} />
                </div>
              </>}

              {objType === 'route' && <>
                <div>
                  <label className={labelCls}>{t.fields.prefix}</label>
                  <input value={fields.prefix ?? ''} onChange={e => set('prefix', e.target.value)} placeholder="192.0.2.0/24" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.fields.originAs}</label>
                  <input value={fields.originAs ?? ''} onChange={e => set('originAs', e.target.value)} placeholder="AS65000" className={inputCls} />
                </div>
              </>}

              {objType === 'route6' && <>
                <div>
                  <label className={labelCls}>{t.fields.prefix6}</label>
                  <input value={fields.prefix6 ?? ''} onChange={e => set('prefix6', e.target.value)} placeholder="2001:db8::/32" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{t.fields.originAs}</label>
                  <input value={fields.originAs ?? ''} onChange={e => set('originAs', e.target.value)} placeholder="AS65000" className={inputCls} />
                </div>
              </>}

              {objType === 'asset' && <>
                <div>
                  <label className={labelCls}>{t.fields.setName}</label>
                  <input value={fields.setName ?? ''} onChange={e => set('setName', e.target.value)} placeholder="AS65000:AS-CUSTOMERS" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t.fields.members}</label>
                  <input value={fields.members ?? ''} onChange={e => set('members', e.target.value)} placeholder="AS65001,AS65002,AS65003" className={inputCls} />
                </div>
              </>}

              <div className="sm:col-span-2">
                <label className={labelCls}>{t.fields.descr}</label>
                <input value={fields.descr ?? ''} onChange={e => set('descr', e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Registry fields */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={labelCls}>{t.fields.mntner}</label>
                <input value={fields.mntner ?? ''} onChange={e => set('mntner', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.adminC}</label>
                <input value={fields.adminC ?? ''} onChange={e => set('adminC', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.techC}</label>
                <input value={fields.techC ?? ''} onChange={e => set('techC', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.source}</label>
                <select value={fields.source ?? 'RADB'} onChange={e => set('source', e.target.value)} className={inputCls}>
                  {t.sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button onClick={generate} className="flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors">
              <FileCode2 size={15} />{t.generate}
            </button>
          </div>

          {output && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800">
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">{t.output}</span>
                <button onClick={copy} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-teal-500 transition-colors">
                  {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <pre className="px-6 py-5 text-sm font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre bg-zinc-950 dark:bg-black leading-relaxed">{output}</pre>
              <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">{t.note}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-teal-500 transition-colors">Gabriel Mowses</a></span>
            <span>MIT License</span>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-1">{t.references}</p>
            <ul className="space-y-0.5">
              {t.refList.map(ref => <li key={ref} className="text-xs text-zinc-400">{ref}</li>)}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
