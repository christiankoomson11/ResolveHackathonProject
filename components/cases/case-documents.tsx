'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Upload, File, Download, Trash2, FileText, FileImage, FileArchive } from 'lucide-react'
import type { CaseDocument, Profile } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface CaseDocumentsProps {
  caseId: string
  documents: (CaseDocument & { uploader: Profile | null })[]
  currentUser: Profile | null
  isStaffOrAdmin: boolean
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FileImage
  if (fileType.includes('zip') || fileType.includes('rar')) return FileArchive
  return FileText
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function CaseDocuments({
  caseId,
  documents,
  currentUser,
  isStaffOrAdmin,
}: CaseDocumentsProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    setUploading(true)

    const supabase = createClient()
    
    // Upload to Supabase Storage
    const fileName = `${caseId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('case-documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      setUploading(false)
      return
    }

    // Save document record
    const { error: insertError } = await supabase.from('case_documents').insert({
      case_id: caseId,
      uploaded_by: currentUser.id,
      file_name: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      file_type: file.type,
    })

    if (insertError) {
      console.error('Error saving document record:', insertError)
    } else {
      router.refresh()
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = async (doc: CaseDocument) => {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('case-documents')
      .createSignedUrl(doc.file_path, 60)

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  const handleDelete = async (docId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    setDeleting(docId)

    const supabase = createClient()

    // Delete from storage
    await supabase.storage.from('case-documents').remove([filePath])

    // Delete record
    const { error } = await supabase.from('case_documents').delete().eq('id', docId)

    if (error) {
      console.error('Error deleting document:', error)
    } else {
      router.refresh()
    }

    setDeleting(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Documents
        </CardTitle>
        <CardDescription>
          Supporting documents for this case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No documents uploaded yet
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.file_type)
              const canDelete = currentUser?.id === doc.uploaded_by || isStaffOrAdmin

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="rounded-lg bg-muted p-2">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)} - Uploaded{' '}
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id, doc.file_path)}
                        disabled={deleting === doc.id}
                      >
                        {deleting === doc.id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Upload Button */}
        <div className="pt-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Spinner className="mr-2" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
          <p className="mt-2 text-xs text-center text-muted-foreground">
            Supported: PDF, DOC, DOCX, TXT, PNG, JPG, ZIP (max 10MB)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
