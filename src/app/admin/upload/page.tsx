import { UploadForm } from '@/components/admin/upload-form'

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Loop</h1>
        <p className="text-muted-foreground">
          Add a new piano loop to the marketplace
        </p>
      </div>

      <div className="max-w-2xl">
        <UploadForm />
      </div>
    </div>
  )
}
