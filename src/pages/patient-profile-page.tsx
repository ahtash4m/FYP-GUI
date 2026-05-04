import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/providers/auth-provider"

export function PatientProfilePage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Replace read-only fields with{" "}
          <code className="rounded bg-muted px-1">GET/PATCH /api/me</code> when the
          backend is ready.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Basic profile details (placeholder).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={user?.displayName ?? ""} readOnly />
          </div>
          <Button type="button" disabled>
            Save changes (placeholder)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
