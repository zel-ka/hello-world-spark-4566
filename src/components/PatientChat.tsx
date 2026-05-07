import { useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Send, Check, CircleDot, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ChatAttachment {
  id: string;
  name: string;
  type: string;
}

interface ChatMessage {
  id: string;
  sender: "patient" | "doctor";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "seen";
  attachments?: ChatAttachment[];
}

const initialChat: ChatMessage[] = [
  {
    id: "1",
    sender: "doctor",
    text: "Habari! I’ve reviewed your last lab results. Let’s discuss your medication schedule.",
    timestamp: "09:12",
    status: "seen",
  },
  {
    id: "2",
    sender: "patient",
    text: "Asante, doctor. I’m still feeling mild chest tightness after exercise.",
    timestamp: "09:14",
    status: "delivered",
  },
];

export function PatientChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChat);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const statusLabel = useMemo(() => {
    if (!messages.length) return "Online";
    return messages[messages.length - 1].status === "seen" ? "Last seen just now" : "Typing...";
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, attachments]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = () => {
    if (!draft.trim() && attachments.length === 0) {
      return;
    }

    const now = new Date();
    const text = draft.trim() || "Sent attachment";
    const patientMessage: ChatMessage = {
      id: String(Date.now()),
      sender: "patient",
      text,
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
      attachments: attachments.length ? attachments : undefined,
    };

    addMessage(patientMessage);
    setDraft("");
    setAttachments([]);
    setIsTyping(false);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === patientMessage.id ? { ...message, status: "delivered" } : message,
        ),
      );
    }, 400);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === patientMessage.id ? { ...message, status: "seen" } : message,
        ),
      );
    }, 1200);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "doctor",
        text: "Thank you. I recommend scheduling a follow-up appointment and keeping your medication on track.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "seen",
      };
      addMessage(reply);
    }, 1800);
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const nextAttachments = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}`,
      name: file.name,
      type: file.type,
    }));

    setAttachments((current) => [...current, ...nextAttachments]);
    setDraft("");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/50">
        <div>
          <p className="text-sm font-semibold text-foreground">Chat with Dr. Mwangi</p>
          <p className="text-xs text-muted-foreground">{statusLabel}</p>
        </div>
        <Badge variant="outline">Online</Badge>
      </div>

      <div className="max-h-[34rem] space-y-3 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
        {messages.map((message) => {
          const isPatient = message.sender === "patient";
          return (
            <div key={message.id} className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] space-y-2 rounded-3xl border p-3 shadow-sm ${isPatient ? "bg-primary text-primary-foreground border-primary/40" : "bg-card text-foreground border-border"}`}>
                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>{message.sender === "patient" ? "You" : "Doctor"}</span>
                  <span>{message.timestamp}</span>
                </div>
                <p className="whitespace-pre-line text-sm leading-6">{message.text}</p>
                {message.attachments?.length ? (
                  <div className="space-y-2">
                    {message.attachments.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 rounded-2xl bg-background/90 px-3 py-2 text-sm border border-border">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
                  <span>{message.status}</span>
                  {message.sender === "patient" && <Check className="h-3 w-3" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {attachments.length > 0 && (
        <div className="mb-3 rounded-3xl bg-secondary/80 p-3 text-sm text-muted-foreground">
          Attached files:
          <ul className="mt-2 space-y-1">
            {attachments.map((file) => (
              <li key={file.id} className="flex items-center gap-2">
                <CircleDot className="h-3 w-3 text-primary" />
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-3">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Andika ujumbe..."
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setIsTyping(event.target.value.length > 0);
            }}
            className="flex-1 rounded-full px-4 py-3"
          />
          <label className="cursor-pointer rounded-full bg-secondary p-3 text-muted-foreground transition hover:text-foreground">
            <Paperclip className="h-4 w-4" />
            <input type="file" onChange={handleFiles} className="hidden" multiple />
          </label>
          <Button variant="secondary" size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isTyping && <p className="text-xs text-muted-foreground">Typing...</p>}
      </div>
    </div>
  );
}
