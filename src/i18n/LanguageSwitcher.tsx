import { useLocale } from './LocaleContext'
import type { LocaleCode } from './LocaleContext'

const OPTIONS: { code: LocaleCode; label: string }[] = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      className="flex items-center gap-0.5 p-0.5 rounded-lg"
      style={{ background: 'var(--al-surface-raised)', border: '1px solid var(--al-border)' }}
      role="group"
      aria-label={t.langSwitcherAria}
    >
      {OPTIONS.map(opt => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLocale(opt.code)}
          aria-pressed={locale === opt.code}
          className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all hover:-translate-y-px active:translate-y-0"
          style={
            locale === opt.code
              ? { background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }
              : { background: 'transparent', color: 'var(--al-text-tertiary)' }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
