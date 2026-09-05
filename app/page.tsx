'use client';

import { useState } from 'react';

type Screen = 'topics' | 'not-covered' | 'checks' | 'routine' | 'red-flag';
type Answer = 'yes' | 'no' | null;

const QUESTIONS = [
  { key: 'fluids', text: 'Can you keep fluids down?' },
  { key: 'pain', text: 'Do you have severe or persistent stomach pain?' },
  { key: 'worse', text: 'Are your symptoms getting worse?' },
] as const;

type QuestionKey = (typeof QUESTIONS)[number]['key'];

const EMPTY_ANSWERS: Record<QuestionKey, Answer> = { fluids: null, pain: null, worse: null };

const btnPrimary =
  'block w-full min-h-[56px] rounded-xl bg-[#1F4E5F] px-5 py-4 text-center font-medium text-white';
const btnChoice =
  'block w-full min-h-[56px] rounded-xl border border-rule bg-white px-5 py-4 text-left font-medium text-ink';
const btnQuiet =
  'block w-full min-h-[56px] rounded-xl border border-rule bg-white px-5 py-4 text-center font-medium text-ink';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('topics');
  const [answers, setAnswers] = useState<Record<QuestionKey, Answer>>(EMPTY_ANSWERS);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.key] !== null);
  const redFlag = answers.fluids === 'no' || answers.pain === 'yes' || answers.worse === 'yes';

  function startAgain() {
    setAnswers(EMPTY_ANSWERS);
    setFeedbackGiven(false);
    setScreen('topics');
  }

  function setAnswer(key: QuestionKey, value: 'yes' | 'no') {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-8 px-5 pb-8 pt-10 text-[18px] leading-normal text-ink">
      {screen === 'topics' && (
        <>
          <h1 className="text-[26px] font-semibold leading-tight">What do you need help with?</h1>
          <div className="flex flex-col gap-3">
            <button type="button" className={btnChoice} onClick={() => setScreen('checks')}>
              Managing nausea
            </button>
            <button type="button" className={btnChoice} onClick={() => setScreen('not-covered')}>
              How to take my injection
            </button>
            <button type="button" className={btnChoice} onClick={() => setScreen('not-covered')}>
              I missed a dose
            </button>
            <button type="button" className={btnChoice} onClick={() => setScreen('not-covered')}>
              Something else
            </button>
          </div>
          <p className="mt-auto text-[15px] leading-snug text-slate">
            Answers are written and approved by clinicians. For anything urgent call 111 or 999.
          </p>
        </>
      )}

      {screen === 'not-covered' && (
        <>
          <p>This isn&apos;t covered yet — please call your practice or 111.</p>
          <button type="button" className={btnQuiet} onClick={() => setScreen('topics')}>
            Back
          </button>
        </>
      )}

      {screen === 'checks' && (
        <>
          <h1 className="text-[26px] font-semibold leading-tight">A few quick checks first</h1>
          <div className="flex flex-col gap-6">
            {QUESTIONS.map((q) => (
              <div key={q.key} className="flex flex-col gap-3">
                <p>{q.text}</p>
                <div className="flex gap-3">
                  {(['yes', 'no'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={answers[q.key] === value}
                      onClick={() => setAnswer(q.key, value)}
                      className={
                        'min-h-[52px] flex-1 rounded-xl border px-4 font-medium ' +
                        (answers[q.key] === value
                          ? 'border-[#1F4E5F] bg-[#1F4E5F] text-white'
                          : 'border-rule bg-white text-ink')
                      }
                    >
                      {value === 'yes' ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={btnPrimary + ' disabled:opacity-40'}
            disabled={!allAnswered}
            onClick={() => setScreen(redFlag ? 'red-flag' : 'routine')}
          >
            Continue
          </button>
          <p className="mt-auto text-[15px] leading-snug text-slate">
            These are the same questions a pharmacist would ask.
          </p>
        </>
      )}

      {screen === 'routine' && (
        <>
          <h1 className="text-[26px] font-semibold leading-tight text-taken">
            This is common in the first weeks.
          </h1>
          <div className="flex flex-col gap-4">
            <p>Eat smaller meals and stop when you feel full.</p>
            <p>Avoid fatty or spicy food for now.</p>
            <p>Sip fluids through the day.</p>
          </div>
          <p className="text-slate">Contact your practice if it doesn&apos;t settle in a week.</p>
          {!feedbackGiven ? (
            <div className="flex flex-col gap-3">
              <p>Did this answer your question?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="min-h-[52px] flex-1 rounded-xl border border-rule bg-white font-medium text-ink"
                  onClick={() => setFeedbackGiven(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="min-h-[52px] flex-1 rounded-xl border border-rule bg-white font-medium text-ink"
                  onClick={() => setFeedbackGiven(true)}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p>Thanks — noted.</p>
              <button type="button" className={btnQuiet} onClick={startAgain}>
                Start again
              </button>
            </div>
          )}
        </>
      )}

      {screen === 'red-flag' && (
        <>
          <h1 className="text-[26px] font-semibold leading-tight text-missed">Please get help now.</h1>
          <p>
            Severe or persistent stomach pain, not keeping fluids down, or symptoms getting worse
            need to be checked today. Call 111, or 999 if you feel very unwell.
          </p>
          <div className="flex flex-col gap-3">
            <a href="tel:111" className={btnPrimary}>
              Call 111
            </a>
            <a
              href="tel:999"
              className="block min-h-[56px] w-full rounded-xl border-2 border-missed px-5 py-4 text-center font-medium text-missed"
            >
              Call 999
            </a>
          </div>
          <button
            type="button"
            onClick={startAgain}
            className="mx-auto mt-auto block py-3 text-[15px] text-slate underline underline-offset-4"
          >
            Start again
          </button>
        </>
      )}
    </main>
  );
}
