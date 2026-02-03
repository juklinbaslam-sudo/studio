
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { getTranslationAndAudio, type ActionState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiKeyModal } from '@/components/api-key-modal';
import { AudioPlayer } from '@/components/audio-player';
import { Logo } from '@/components/icons';
import { ClipboardCopy, LoaderCircle, Languages } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Translating...
        </>
      ) : (
        <>
          <Languages className="mr-2 h-4 w-4" />
          Translate
        </>
      )}
    </Button>
  );
}

const initialState: ActionState = { success: false };

export function MainTranslator() {
  const [state, formAction] = useActionState(getTranslationAndAudio, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const lastToastTimestamp = useRef<number | undefined>();

  useEffect(() => {
    if (state.error && state.timestamp !== lastToastTimestamp.current) {
      toast({
        variant: 'destructive',
        title: 'Translation Error',
        description: state.error,
      });
      lastToastTimestamp.current = state.timestamp;
    }
  }, [state.error, state.timestamp, toast]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${type} text has been copied.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold font-headline">K-Drama Translator</h1>
            <p className="text-sm text-muted-foreground">Indonesian to Natural Korean</p>
          </div>
        </div>
        <ApiKeyModal />
      </header>

      <div className="grid md:grid-cols-2 gap-8 p-4 sm:p-8">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Indonesian Input</CardTitle>
            <CardDescription>Enter the text you want to translate.</CardDescription>
          </CardHeader>
          <form ref={formRef} action={formAction} className="flex-grow flex flex-col">
            <CardContent className="flex-grow">
              <Textarea
                name="text"
                placeholder="e.g., 'Aku cinta kamu'"
                className="h-full min-h-[200px] resize-none text-base"
                maxLength={10000}
                required
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center flex-wrap gap-4">
              <SubmitButton />
               <Button variant="ghost" onClick={() => formRef.current?.reset()}>
                Clear
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Korean Output</CardTitle>
            <CardDescription>Your culturally nuanced translation.</CardDescription>
          </CardHeader>
          <CardContent>
            {useFormStatus().pending ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="flex items-center gap-4 mt-6">
                  <Skeleton className="h-12 w-32 rounded-lg" />
                  <Skeleton className="h-12 w-40 rounded-lg" />
                </div>
              </div>
            ) : state.success && state.data ? (
              <div>
                <div className="relative group">
                  <p className="text-3xl lg:text-4xl font-headline font-bold text-primary-foreground">
                    {state.data.koreanText}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleCopy(state.data!.koreanText, 'Korean')}
                  >
                    <ClipboardCopy className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-lg text-muted-foreground mt-2 font-light tracking-wide">{state.data.romanization}</p>

                <AudioPlayer src={state.data.audioDataUri} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">Translation will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
