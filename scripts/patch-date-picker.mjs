import fs from 'node:fs'

const adminPath = 'src/pages/Admin.jsx'
const cssPath = 'src/styles/admin.css'

let admin = fs.readFileSync(adminPath, 'utf8')

// Garante useRef para controlar o input de data.
admin = admin.replace(
  "import { useEffect, useMemo, useState } from 'react'",
  "import { useEffect, useMemo, useRef, useState } from 'react'"
)

// Injeta um componente de data com botão de calendário sempre visível.
if (!admin.includes('function DateField(')) {
  const marker = '\nfunction Agenda({ data }) {'
  const component = `\nfunction DateField({ value, onChange, label = 'Selecionar data' }) {\n  const inputRef = useRef(null)\n\n  function openCalendar() {\n    const input = inputRef.current\n    if (!input) return\n\n    try {\n      input.focus()\n      if (typeof input.showPicker === 'function') {\n        input.showPicker()\n      } else {\n        input.click()\n      }\n    } catch {\n      input.focus()\n    }\n  }\n\n  return (\n    <div className=\"admin-date-field\">\n      <input\n        ref={inputRef}\n        type=\"date\"\n        value={value}\n        onClick={openCalendar}\n        onChange={onChange}\n        aria-label={label}\n      />\n      <button type=\"button\" className=\"admin-date-button\" onClick={openCalendar} aria-label={label} title={label}>\n        <CalendarDays size={18} />\n      </button>\n    </div>\n  )\n}\n`
  admin = admin.replace(marker, component + marker)
}

// Troca todos os inputs de data simples pelo componente robusto.
const replacements = [
  [
    '<input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/>',
    '<DateField value={form.data} onChange={e=>setForm({...form,data:e.target.value})} />'
  ],
  [
    '<input\n            type="date"\n            value={form.data}\n            onChange={e => setForm({ ...form, data: e.target.value })}\n          />',
    '<DateField value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />'
  ],
  [
    '<input type="date" value={sessao.data} onChange={e=>setSessao({...sessao,data:e.target.value})}/>',
    '<DateField value={sessao.data} onChange={e=>setSessao({...sessao,data:e.target.value})} label="Selecionar data da sessão" />'
  ],
  [
    '<input type="date" value={acao.data} onChange={e=>setAcao({...acao,data:e.target.value})}/>',
    '<DateField value={acao.data} onChange={e=>setAcao({...acao,data:e.target.value})} label="Selecionar data da ação/comunidade" />'
  ]
]

for (const [from, to] of replacements) admin = admin.replaceAll(from, to)

// Campo do dossiê de mandatos anteriores, gerado por outro patch antes deste.
admin = admin.replaceAll(
  '<input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})}/>',
  '<DateField value={form.data} onChange={e=>setForm({...form,data:e.target.value})} />'
)

fs.writeFileSync(adminPath, admin)

let css = fs.readFileSync(cssPath, 'utf8')
if (!css.includes('/* DATE_PICKER_BUTTON */')) {
  css += `\n\n/* DATE_PICKER_BUTTON */\n.admin-date-field{position:relative;display:flex;align-items:center;min-width:0}.admin-date-field>input{width:100%!important;padding-right:48px!important;cursor:pointer!important;color-scheme:light!important}.admin-date-field>input::-webkit-calendar-picker-indicator{opacity:1!important;display:block!important;cursor:pointer!important}.admin-date-button{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:36px;height:34px;border:1px solid #d8cde3;border-radius:8px;background:#f7f2fb;color:#5421a6;display:grid;place-items:center;cursor:pointer;z-index:3}.admin-date-button:hover{background:#eee5f7}.admin-date-button:active{transform:translateY(-50%) scale(.96)}\n`
  fs.writeFileSync(cssPath, css)
}

console.log('[date-picker] calendário restaurado com botão visível nos campos de data do painel.')
