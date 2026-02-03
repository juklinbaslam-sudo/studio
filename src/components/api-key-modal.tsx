import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';

export function ApiKeyModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="API Key Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Key Configuration</DialogTitle>
          <DialogDescription>
            This app uses Google Gemini and ElevenLabs APIs. For the app to function, you need to configure your API keys as environment variables.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2 text-sm">
          <div className="space-y-2">
            <h3 className="font-headline font-semibold text-primary">Google AI (Gemini)</h3>
            <p className="text-muted-foreground">
              The application uses Application Default Credentials (ADC) for authentication. Ensure you have the gcloud CLI installed and run the following command to log in:
            </p>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-code text-sm font-semibold">
              gcloud auth application-default login
            </code>
          </div>
          <div className="space-y-2">
            <h3 className="font-headline font-semibold text-primary">ElevenLabs</h3>
            <p className="text-muted-foreground">
              Create a file named <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-code text-sm font-semibold">.env.local</code> in the root of your project and add your ElevenLabs API key:
            </p>
            <code className="relative block rounded bg-muted p-2 font-code text-sm">
              ELEVENLABS_API_KEY=&quot;your_key_here&quot;
            </code>
          </div>
          <p className="text-sm text-muted-foreground">
            After setting up the variables, you must restart your development server for the changes to take effect.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
