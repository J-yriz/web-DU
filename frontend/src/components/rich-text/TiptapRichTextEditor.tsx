'use client'

import { useCallback, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import YoutubeExtension from '@tiptap/extension-youtube'
import TiptapImage from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Youtube,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import '@/styles/tiptap-editor.css'

function normalizeYoutubeUrl(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  try {
    const u = new URL(s)
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '')
      return id ? `https://www.youtube.com/watch?v=${id}` : null
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/watch?v=${v}`
      const shorts = u.pathname.match(/\/shorts\/([^/?]+)/)
      if (shorts?.[1]) return `https://www.youtube.com/watch?v=${shorts[1]}`
    }
    return s
  } catch {
    return null
  }
}

type PromptDialogType = 'youtube' | 'image' | 'link' | null

const dialogMeta: Record<Exclude<PromptDialogType, null>, { title: string; description: string; placeholder: string; icon: React.ReactNode }> = {
  youtube: {
    title: 'Sisipkan Video YouTube',
    description: 'Tempel URL video YouTube (watch, youtu.be, atau Shorts).',
    placeholder: 'https://youtube.com/watch?v=...',
    icon: <Youtube className="size-5" />,
  },
  image: {
    title: 'Sisipkan Gambar',
    description: 'Masukkan URL gambar yang valid (http/https).',
    placeholder: 'https://example.com/gambar.jpg',
    icon: <ImagePlus className="size-5" />,
  },
  link: {
    title: 'Sisipkan Tautan',
    description: 'Masukkan URL tautan. Kosongkan untuk menghapus tautan.',
    placeholder: 'https://...',
    icon: <Link2 className="size-5" />,
  },
}

export type TiptapRichTextEditorProps = {
  initialContent: string
  onChange: (html: string) => void
  placeholder?: string
  variant?: 'default' | 'compact'
}

export function TiptapRichTextEditor({
  initialContent,
  onChange,
  placeholder = 'Tulis modul dan konten kursus di sini. Gunakan toolbar untuk format dan sisipkan video YouTube.',
  variant = 'default',
}: TiptapRichTextEditorProps) {
  const [dialogType, setDialogType] = useState<PromptDialogType>(null)
  const [dialogValue, setDialogValue] = useState('')
  const [dialogError, setDialogError] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      LinkExtension.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      TiptapImage.configure({ inline: false, allowBase64: true }),
      YoutubeExtension.configure({
        width: 640,
        height: 360,
        nocookie: true,
        HTMLAttributes: { class: 'rounded-lg overflow-hidden max-w-full' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn('tiptap-editor-root max-w-none focus:outline-none', variant === 'compact' && 'min-h-[160px]'),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  const openDialog = useCallback((type: Exclude<PromptDialogType, null>) => {
    if (!editor) return
    const defaultVal = type === 'link' ? (editor.getAttributes('link').href as string | undefined) ?? 'https://' : ''
    setDialogValue(defaultVal)
    setDialogError('')
    setDialogType(type)
  }, [editor])

  const handleDialogConfirm = useCallback(() => {
    if (!editor || !dialogType) return

    if (dialogType === 'youtube') {
      const normalized = normalizeYoutubeUrl(dialogValue)
      if (!normalized) {
        setDialogError('URL YouTube tidak valid. Gunakan format watch, youtu.be, atau Shorts.')
        return
      }
      editor.chain().focus().setYoutubeVideo({ src: normalized }).run()
    }

    if (dialogType === 'image') {
      const val = dialogValue.trim()
      if (!val) { setDialogError('URL tidak boleh kosong.'); return }
      try {
        const u = new URL(val)
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error()
      } catch {
        setDialogError('Masukkan URL gambar yang valid (http/https).')
        return
      }
      editor.chain().focus().setImage({ src: val }).run()
    }

    if (dialogType === 'link') {
      const val = dialogValue.trim()
      if (!val) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: val }).run()
      }
    }

    setDialogType(null)
    setDialogValue('')
    setDialogError('')
  }, [editor, dialogType, dialogValue])

  if (!editor) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Memuat editor…
      </div>
    )
  }

  const barBtn = (active?: boolean) =>
    cn(
      'h-9 w-9 shrink-0 rounded-lg p-0 shadow-none',
      active ? 'bg-primary/15 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    )

  const shell = variant === 'compact' ? 'rounded-xl border border-slate-200 bg-white' : 'rounded-2xl border border-slate-200 bg-white'

  const meta = dialogType ? dialogMeta[dialogType] : null

  return (
    <>
      <div className={cn('overflow-hidden', shell)}>
        <div className={cn('flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/90 px-2', variant === 'compact' ? 'py-1.5' : 'py-2')}>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} aria-label="Heading 1">
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2">
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Heading 3">
            <Heading3 className="h-4 w-4" />
          </Button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('paragraph'))} onClick={() => editor.chain().focus().setParagraph().run()} aria-label="Paragraf">
            <Pilcrow className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()} aria-label="Underline">
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()} aria-label="Inline code">
            <Code className="h-4 w-4" />
          </Button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list">
            <List className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Ordered list">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="Quote">
            <Quote className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} aria-label="Code block">
            <Braces className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()} aria-label="Horizontal rule">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive({ textAlign: 'left' }))} onClick={() => editor.chain().focus().setTextAlign('left').run()} aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive({ textAlign: 'center' }))} onClick={() => editor.chain().focus().setTextAlign('center').run()} aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive({ textAlign: 'right' }))} onClick={() => editor.chain().focus().setTextAlign('right').run()} aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive({ textAlign: 'justify' }))} onClick={() => editor.chain().focus().setTextAlign('justify').run()} aria-label="Justify">
            <AlignJustify className="h-4 w-4" />
          </Button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          <input
            type="color"
            className="h-9 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
            aria-label="Warna teks"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
          <Button type="button" variant="ghost" size="sm" className={barBtn(editor.isActive('highlight'))} onClick={() => editor.chain().focus().toggleHighlight().run()} aria-label="Sorot">
            <Highlighter className="h-4 w-4" />
          </Button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => openDialog('link')} aria-label="Tautan">
            <Link2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => openDialog('image')} aria-label="Gambar dari URL">
            <ImagePlus className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => openDialog('youtube')} aria-label="YouTube">
            <Youtube className="h-4 w-4" />
          </Button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className={barBtn(false)} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <EditorContent editor={editor} className={cn('tiptap-editor-root bg-white', variant === 'compact' && 'min-h-[200px]')} />
      </div>

      {/* Embed / Link / Image Dialog */}
      <Dialog open={dialogType !== null} onOpenChange={(open) => { if (!open) { setDialogType(null); setDialogValue(''); setDialogError('') } }}>
        <DialogContent className="max-w-sm sm:max-w-md">
          {meta && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {meta.icon}
                  </div>
                  <div>
                    <DialogTitle>{meta.title}</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">{meta.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="embed-url" className="text-xs font-semibold text-slate-700 sm:text-sm">URL</Label>
                <Input
                  id="embed-url"
                  type="url"
                  value={dialogValue}
                  onChange={(e) => { setDialogValue(e.target.value); setDialogError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleDialogConfirm() } }}
                  placeholder={meta.placeholder}
                  autoFocus
                  className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-primary/30 sm:h-11"
                />
                {dialogError && <p className="text-xs font-medium text-rose-500">{dialogError}</p>}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 shadow-none hover:bg-slate-50 sm:h-10 sm:text-sm">
                    Batal
                  </Button>
                </DialogClose>
                <Button size="sm" className="h-9 rounded-xl text-xs font-semibold shadow-none sm:h-10 sm:text-sm" onClick={handleDialogConfirm}>
                  Sisipkan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
