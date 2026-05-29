import { useState } from "react";
import { Brain, ChevronLeft, ChevronRight, Sparkles, StickyNote, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { HellowModal } from "@/components/HellowModal";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { useUIStore } from "@/store/useUIStore";
import { useGenerateMicroLearningMutation, useSaveLessonAsNoteMutation } from "@/hooks/useMicroLearningMutations";
import type { MicroLearningResult } from "@/services/ai";
import { cn } from "@/lib/utils";

type Step = "topic" | "lesson" | "quiz" | "done";

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const FORMATS = [
  { value: "explanation", label: "Explanation" },
  { value: "guide", label: "Guide" },
  { value: "qa", label: "Q&A" },
] as const;

const LENGTHS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const;

export function MicroLearningModal() {
  const open = useUIStore((s) => s.modals.microLearning);
  const closeModal = useUIStore((s) => s.closeModal);
  const showToast = useUIStore((s) => s.showToast);

  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<string>("beginner");
  const [format, setFormat] = useState<string>("explanation");
  const [length, setLength] = useState<string>("medium");
  const [lesson, setLesson] = useState<MicroLearningResult | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const generate = useGenerateMicroLearningMutation();
  const saveAsNote = useSaveLessonAsNoteMutation();

  function handleGenerate() {
    if (!topic.trim()) return;
    generate.mutate(
      { topic: topic.trim(), difficulty: difficulty as any, format: format as any, length: length as any },
      {
        onSuccess: (result) => {
          setLesson(result);
          setCurrentSection(0);
          setQuizAnswers({});
          setQuizSubmitted(false);
          setStep("lesson");
        },
      },
    );
  }

  function handleSaveLesson() {
    if (!lesson) return;
    saveAsNote.mutate({ title: lesson.title, content: lesson.content });
  }

  function handleRetake() {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setStep("quiz");
  }

  function handleQuizSubmit() {
    setQuizSubmitted(true);
  }

  function handleQuizAnswer(qIdx: number, optionIdx: number) {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }));
  }

  function quizScore(): { correct: number; total: number } {
    if (!lesson) return { correct: 0, total: 0 };
    let correct = 0;
    for (let i = 0; i < lesson.quizQuestions.length; i++) {
      if (quizAnswers[i] === lesson.quizQuestions[i].correctIndex) correct++;
    }
    return { correct, total: lesson.quizQuestions.length };
  }

  function handleClose() {
    closeModal("microLearning");
    // Reset after animation
    setTimeout(() => {
      setStep("topic");
      setTopic("");
      setLesson(null);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }, 300);
  }

  const sections = lesson
    ? [
        { title: "Lesson", content: lesson.content },
        { title: "Key Takeaways", content: lesson.keyTakeaways.map((t) => `- ${t}`).join("\n") },
      ]
    : [];

  return (
    <HellowModal open={open} onClose={handleClose} title="Micro Learning" maxWidth="max-w-[700px]">
      {step === "topic" && (
        <div className="flex flex-col gap-5 py-4">
          <div className="text-center">
            <Brain className="h-10 w-10 text-primary/40 mx-auto mb-2" />
            <p className="text-sm text-foreground/60">Learn anything in bite-sized lessons</p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-foreground/60">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Computing, REST APIs, Python decorators..."
              className="h-10 rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary/40 transition"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60">Difficulty</label>
              <div className="flex gap-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={cn(
                      "flex-1 h-8 rounded-lg text-xs font-medium transition",
                      difficulty === d.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface border border-border text-foreground/60 hover:bg-accent",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60">Format</label>
              <div className="flex gap-1">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={cn(
                      "flex-1 h-8 rounded-lg text-xs font-medium transition",
                      format === f.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface border border-border text-foreground/60 hover:bg-accent",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60">Length</label>
              <div className="flex gap-1">
                {LENGTHS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLength(l.value)}
                    className={cn(
                      "flex-1 h-8 rounded-lg text-xs font-medium transition",
                      length === l.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface border border-border text-foreground/60 hover:bg-accent",
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || generate.isPending}
            className="h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {generate.isPending ? (
              <>Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Lesson</>
            )}
          </button>
        </div>
      )}

      {step === "lesson" && lesson && (
        <div className="flex flex-col gap-4">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {sections.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition",
                    i <= currentSection ? "bg-primary" : "bg-border",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-foreground/40 shrink-0">
              {currentSection + 1} / {sections.length}
            </span>
          </div>

          {/* Section title */}
          <h3 className="text-base font-semibold">{sections[currentSection].title}</h3>

          {/* Content */}
          <div className="max-h-[40vh] overflow-y-auto">
            {currentSection === 0 ? (
              <MarkdownRenderer content={sections[0].content} />
            ) : (
              <MarkdownRenderer content={sections[1].content} />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              onClick={() => setCurrentSection((p) => Math.max(0, p - 1))}
              disabled={currentSection === 0}
              className="flex items-center gap-1 h-9 px-3 rounded-lg text-sm hover:bg-accent transition disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveLesson}
                className="flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-foreground/60 hover:bg-accent transition"
              >
                <StickyNote className="h-4 w-4" /> Save
              </button>

              {currentSection < sections.length - 1 ? (
                <button
                  onClick={() => setCurrentSection((p) => p + 1)}
                  className="flex items-center gap-1 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setStep(lesson.quizQuestions.length > 0 ? "quiz" : "done")}
                  className="flex items-center gap-1 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                >
                  {lesson.quizQuestions.length > 0 ? "Take Quiz" : "Finish"} <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === "quiz" && lesson && lesson.quizQuestions.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-semibold">Quiz</h3>

          {!quizSubmitted && (
            <p className="text-xs text-foreground/50">Answer all questions to test your understanding</p>
          )}

          {quizSubmitted && (
            <div className="flex items-center gap-2 text-sm">
              {quizScore().correct === quizScore().total ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4" /> Perfect score!
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <XCircle className="h-4 w-4" /> {quizScore().correct} / {quizScore().total} correct
                </span>
              )}
            </div>
          )}

          <div className="max-h-[45vh] overflow-y-auto space-y-4">
            {lesson.quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-xl bg-surface border border-border p-4">
                <p className="text-sm font-medium mb-2">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="space-y-1">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = quizAnswers[qIdx] === oIdx;
                    const isCorrect = q.correctIndex === oIdx;
                    const showResult = quizSubmitted;

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleQuizAnswer(qIdx, oIdx)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition border",
                          isSelected && !showResult && "border-primary bg-primary/5",
                          showResult && isCorrect && "border-green-500 bg-green-500/10",
                          showResult && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                          !isSelected && !showResult && "border-border hover:bg-accent/50",
                          !isSelected && showResult && "border-border/50",
                        )}
                      >
                        {opt}
                        {showResult && isCorrect && <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500 inline ml-2" />}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <p className="text-xs text-foreground/50 mt-2 italic">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button
              onClick={() => setStep("lesson")}
              className="flex items-center gap-1 h-9 px-3 rounded-lg text-sm hover:bg-accent transition"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Lesson
            </button>

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < lesson.quizQuestions.length}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="flex items-center gap-1 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
              >
                <RotateCcw className="h-4 w-4" /> Retake
              </button>
            )}
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h3 className="text-lg font-semibold">Lesson Complete!</h3>
          <p className="text-sm text-foreground/50 max-w-xs">
            You've finished learning about <strong>{lesson?.title}</strong>.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setStep("topic"); setTopic(""); setLesson(null); }}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              New Lesson
            </button>
            <button
              onClick={handleSaveLesson}
              className="flex items-center gap-1 h-9 px-4 rounded-lg border border-border text-sm hover:bg-accent transition"
            >
              <StickyNote className="h-4 w-4" /> Save as Note
            </button>
          </div>
        </div>
      )}
    </HellowModal>
  );
}
