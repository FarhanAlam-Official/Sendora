'use client'

import { Button } from '@/components/ui/button'
import { showToast } from '@/components/ui/toast'
import { notifications } from '@/lib/notifications'
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2, Sparkles, Zap } from 'lucide-react'

export default function ToastDemoPage() {
  // Helper function to simulate async operations
  const simulatePromise = (shouldSucceed: boolean = true, delay: number = 2000) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSucceed) {
          resolve({ message: 'Operation completed successfully!', data: { count: 42 } })
        } else {
          reject(new Error('Operation failed due to an unexpected error'))
        }
      }, delay)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Toast Notification Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore all the features of our beautiful toast notification system
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => notifications.dismiss()}
            >
              Dismiss All Toasts
            </Button>
          </div>
        </div>

        {/* Basic Toast Types */}
        <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Basic Toast Types</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Success Toast */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Success Toast</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Display success messages with a green gradient design
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    showToast.success({
                      title: 'Success!',
                      description: 'Your operation completed successfully.',
                    })
                  }}
                >
                  Basic Success
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    notifications.showSuccess({
                      title: 'File Uploaded',
                      description: 'certificate.pdf has been uploaded successfully.',
                    })
                  }}
                >
                  Using Manager
                </Button>
              </div>
            </div>

            {/* Error Toast */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold">Error Toast</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Show error messages with red gradient styling
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    showToast.error({
                      title: 'Error!',
                      description: 'Something went wrong. Please try again.',
                    })
                  }}
                >
                  Basic Error
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    notifications.showError({
                      title: 'Upload Failed',
                      description: 'Unable to upload file. Please check your connection.',
                    })
                  }}
                >
                  Using Manager
                </Button>
              </div>
            </div>

            {/* Warning Toast */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Warning Toast</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Alert users with yellow/amber gradient warnings
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    showToast.warning({
                      title: 'Warning!',
                      description: 'This action cannot be undone.',
                    })
                  }}
                >
                  Basic Warning
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    notifications.showWarning('You are about to delete this item permanently.')
                  }}
                >
                  Using Manager
                </Button>
              </div>
            </div>

            {/* Info Toast */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Info Toast</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Display informational messages with blue gradient
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    showToast.info({
                      title: 'Info',
                      description: 'New features are available in your dashboard.',
                    })
                  }}
                >
                  Basic Info
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    notifications.showInfo('Your profile has been updated successfully.')
                  }}
                >
                  Using Manager
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Loader2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Advanced Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Promise-based Toast */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <h3 className="font-semibold mb-3">Promise-based Toast</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically show loading, then success or error based on promise result
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    showToast.promise(
                      simulatePromise(true, 2000),
                      {
                        loading: 'Processing your request...',
                        success: 'Data saved successfully!',
                        error: 'Failed to save data',
                      }
                    )
                  }}
                >
                  Success Promise
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    showToast.promise(
                      simulatePromise(false, 2000),
                      {
                        loading: 'Uploading file...',
                        success: 'File uploaded!',
                        error: (err:any) => `Upload failed: ${err?.message}`,
                      }
                    )
                  }}
                >
                  Error Promise
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    notifications.promise(
                      simulatePromise(true, 3000),
                      {
                        loading: 'Sending emails...',
                        success: (data: any) => `Sent ${data?.data?.count || 0} emails successfully!`,
                        error: 'Failed to send emails',
                      }
                    )
                  }}
                >
                  Using Manager
                </Button>
              </div>
            </div>

            {/* Custom Duration */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <h3 className="font-semibold mb-3">Custom Duration</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Control how long the toast stays visible
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    showToast.success({
                      title: 'Short Toast',
                      description: 'This will disappear quickly (1 second)',
                      duration: 1000,
                    })
                  }}
                >
                  1 Second
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    notifications.showSuccess({
                      title: 'Medium Toast',
                      description: 'This stays visible for 5 seconds',
                      duration: 5000,
                    })
                  }}
                >
                  5 Seconds (Manager)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    showToast.info({
                      title: 'Long Toast',
                      description: 'This stays visible longer (8 seconds)',
                      duration: 8000,
                    })
                  }}
                >
                  8 Seconds
                </Button>
              </div>
            </div>

            {/* Multiple Toasts */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <h3 className="font-semibold mb-3">Multiple Toasts</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Show multiple notifications at once
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  showToast.success({ title: 'First Toast', description: 'This is the first notification' })
                  setTimeout(() => {
                    showToast.info({ title: 'Second Toast', description: 'This is the second notification' })
                  }, 300)
                  setTimeout(() => {
                    showToast.warning({ title: 'Third Toast', description: 'This is the third notification' })
                  }, 600)
                }}
              >
                Show 3 Toasts
              </Button>
            </div>

            {/* Rich Content */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <h3 className="font-semibold mb-3">Rich Content</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Toasts with longer, detailed descriptions
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  showToast.success({
                    title: 'Email Sent Successfully',
                    description: 'Your certificate has been sent to john.doe@example.com. The recipient will receive a PDF attachment with their personalized certificate.',
                    duration: 5000,
                  })
                }}
              >
                Detailed Toast
              </Button>
            </div>
          </div>
        </div>

        {/* Real-world Examples */}
        <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Real-world Examples</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                notifications.promise(
                  simulatePromise(true, 1500),
                  {
                    loading: 'Uploading certificate...',
                    success: 'Certificate uploaded and ready to send!',
                    error: 'Upload failed. Please try again.',
                  }
                )
              }}
            >
              Upload Certificate
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                notifications.promise(
                  simulatePromise(true, 2000),
                  {
                    loading: 'Sending emails...',
                    success: (data: any) => `Successfully sent ${data?.data?.count || 10} certificates!`,
                    error: 'Failed to send emails. Check your SMTP settings.',
                  },
                  { duration: 6000 }
                )
              }}
            >
              Send Bulk Emails
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                notifications.showSuccess({
                  title: 'Settings Saved',
                  description: 'Your SMTP configuration has been updated.',
                  duration: 4000,
                })
              }}
            >
              Save Settings
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                notifications.showError({
                  title: 'Validation Error',
                  description: 'Please fill in all required fields before submitting.',
                })
              }}
            >
              Form Validation
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                notifications.showWarning('You have unsaved changes. Are you sure you want to leave?')
              }}
            >
              Unsaved Changes
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                notifications.showInfo('New features available! Check out the updated dashboard.')
              }}
            >
              Feature Update
            </Button>
          </div>
        </div>

        {/* Code Examples */}
        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Using showToast directly:</h3>
              <pre className="text-xs overflow-x-auto">
                <code>{`import { showToast } from '@/components/ui/toast'

showToast.success({
  title: 'Success!',
  description: 'Operation completed',
  duration: 2500
})`}</code>
              </pre>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Using notifications manager:</h3>
              <pre className="text-xs overflow-x-auto">
                <code>{`import { notifications } from '@/lib/notifications'

notifications.showSuccess({
  title: 'File Uploaded',
  description: 'Your file is ready',
  duration: 5000
})

// String shortcut also works
notifications.showWarning('Warning message')`}</code>
              </pre>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Promise-based toast:</h3>
              <pre className="text-xs overflow-x-auto">
                <code>{`notifications.promise(
  myPromise,
  {
    loading: 'Processing...',
    success: 'Done!',
    error: 'Failed'
  },
  { duration: 5000 }  // Optional duration
)`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

