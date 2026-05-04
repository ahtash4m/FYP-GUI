import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function PatientHelpPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help guide</h1>
        <p className="text-sm text-muted-foreground">
          Static guidance for now; swap for CMS or markdown from API later.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Taking a good photo</CardTitle>
          <CardDescription>Improves model confidence (see SRS assumptions).</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>Use bright, even lighting and avoid harsh shadows.</li>
            <li>Face the camera; try to keep hair off your forehead and cheeks.</li>
            <li>Remove heavy makeup if possible for a clearer lesion view.</li>
            <li>Minimum resolution around 224×224 pixels (larger is better).</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>What this app does not do</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          It does not diagnose conditions other than the acne model&apos;s scope,
          prescribe antibiotics or isotretinoin, or replace an in-person
          dermatology visit.
        </CardContent>
      </Card>
    </div>
  )
}
