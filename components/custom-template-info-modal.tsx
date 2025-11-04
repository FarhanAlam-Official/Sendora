"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, ImageIcon } from "lucide-react"

interface CustomTemplateInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CustomTemplateInfoModal({ open, onOpenChange, trigger }: CustomTemplateInfoModalProps) {
  const [imageError, setImageError] = useState(false)

  // Reset error state when dialog opens
  useEffect(() => {
    if (open) {
      setImageError(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="!max-w-[calc(100%-2rem)] sm:!max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom Template Guide</DialogTitle>
          <DialogDescription>
            Learn how to create and upload your custom certificate template
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
            {/* Left Column - Stacked Sections */}
            <div className="space-y-4">
              {/* Option 1: Canva */}
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Option 1: Canva</h4>
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Create a new design in Canva (recommended size: 1920x1080px or 11x8.5 inches)</li>
                    <li>Design your certificate with all decorative elements, borders, and text</li>
                    <li>Leave an empty space where the recipient name will be displayed</li>
                    <li>Export as PNG or JPG image</li>
                  </ul>
                </div>
              </div>

              {/* Option 2: Google Slides */}
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Option 2: Google Slides</h4>
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Create a new presentation in Google Slides</li>
                    <li>Set slide size to 11x8.5 inches (or 1920x1080px)</li>
                    <li>Design your certificate template</li>
                    <li>Leave a blank area for the recipient name</li>
                    <li>Download as PNG or JPG image</li>
                  </ul>
                </div>
              </div>

              {/* Important Requirements */}
              <div className="space-y-2">
                <h4 className="font-semibold text-base">Important Requirements</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">Empty Space for Name:</strong>
                      <p className="text-muted-foreground">
                        Make sure to leave a clear, empty area in your template where the recipient name will be displayed. 
                        You'll be able to position the name precisely after uploading.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">File Format:</strong>
                      <p className="text-muted-foreground">
                        Upload your template as PNG or JPG image. Recommended dimensions: 1920x1080px or similar aspect ratio.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">File Size:</strong>
                      <p className="text-muted-foreground">
                        Maximum file size: 10MB. For best quality, use high-resolution images.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sample Template */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base">Sample Template</h4>
              <p className="text-sm text-muted-foreground">
                Here's an example of what a good custom template looks like. Notice the empty space reserved for the recipient name:
              </p>
              <div className="border border-border rounded-lg overflow-hidden bg-muted/20 min-h-[300px] flex items-center justify-center">
                {!imageError ? (
                  <img
                    src="/sample-certificate-template.png"
                    alt="Sample certificate template"
                    className="w-full h-auto"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <div className="rounded-full bg-muted p-4">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Sample Template Preview</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Tip: After uploading, you can click on your template image to position where the recipient name should appear.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

