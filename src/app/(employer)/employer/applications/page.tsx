"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  GripVertical, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  Loader2,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { calculateMatchScore } from "@/lib/matching";

// === DND-KIT Imports ===
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type ApplicationStatus = "pending" | "reviewed" | "interview" | "rejected";

interface ApplicationData {
  id: string;
  applicantName: string;
  applicantPhone: string; // اضافه شدن فیلد شماره موبایل برای ارسال پیامک
  jobTitle: string;
  date: string;
  matchScore: number;
  status: ApplicationStatus;
  jobSeekerId: string;
  jobId: string; 
}

const COLUMNS = [
  { id: "pending", title: "دریافت شده", icon: Clock, color: "border-orange-200 bg-orange-50 text-orange-700" },
  { id: "reviewed", title: "در حال بررسی", icon: Eye, color: "border-blue-200 bg-blue-50 text-blue-700" },
  { id: "interview", title: "دعوت به مصاحبه", icon: CheckCircle2, color: "border-green-200 bg-green-50 text-green-700" },
  { id: "rejected", title: "رد شده", icon: XCircle, color: "border-red-200 bg-red-50 text-red-700" },
];

// ==========================================
// 1. کامپوننت کارت رزومه (استفاده مجدد)
// ==========================================
const ApplicationCard = ({ 
  app, 
  handleStartChat, 
  isStartingChat, 
  isOverlay = false 
}: { 
  app: ApplicationData, 
  handleStartChat?: (app: ApplicationData) => void, 
  isStartingChat?: string | null,
  isOverlay?: boolean
}) => (
  <div className={`group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all ${isOverlay ? 'shadow-2xl ring-2 ring-primary/50 rotate-2 cursor-grabbing' : 'hover:border-primary/30 hover:shadow-md cursor-grab'}`}>
    <div className="absolute left-3 top-4 text-slate-300 group-hover:text-slate-400">
      <GripVertical className="h-5 w-5" />
    </div>

    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <User className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900">{app.applicantName}</h4>
        <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">{app.jobTitle}</p>
      </div>
    </div>

    <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Clock className="h-3.5 w-3.5" />
        {app.date}
      </div>
      <div className={`flex items-center gap-1 rounded-md px-2 py-1 font-bold ${
        app.matchScore >= 75 ? "bg-green-100 text-green-700" :
        app.matchScore >= 50 ? "bg-blue-100 text-blue-700" :
        "bg-orange-100 text-orange-700"
      }`}>
        تطابق: {app.matchScore}٪
      </div>
    </div>

    <div className="mt-2 flex items-center gap-2">
      <Link href={`/employer/applicant/${app.jobSeekerId}`} className="flex-1">
        <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700">
          مشاهده
        </Button>
      </Link>
      <Button 
        variant="primary" 
        size="sm" 
        className="flex-1 h-8 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white border-0 flex items-center justify-center gap-1.5"
        onClick={() => handleStartChat && handleStartChat(app)}
        isLoading={isStartingChat === app.id}
      >
        {!isStartingChat && <MessageSquare className="h-3.5 w-3.5" />}
        پیام
      </Button>
    </div>
  </div>
);

// ==========================================
// 2. کامپوننت قابل درگ شدن (Draggable)
// ==========================================
function DraggableItem({ app, handleStartChat, isStartingChat }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: { app },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <ApplicationCard app={app} handleStartChat={handleStartChat} isStartingChat={isStartingChat} />
    </div>
  );
}

// ==========================================
// 3. کامپوننت ستون هدف (Droppable)
// ==========================================
function DroppableColumn({ column, apps, children }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex min-w-[300px] flex-1 flex-col rounded-2xl p-4 transition-colors ${
        isOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-slate-100/50"
      }`}
    >
      <div className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 ${column.color}`}>
        <div className="flex items-center gap-2 font-bold">
          <column.icon className="h-5 w-5" />
          {column.title}
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/50 text-xs font-bold text-inherit">
          {apps.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 min-h-[150px]">
        {children}
        {apps.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
            کارت را اینجا رها کنید
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// کامپوننت اصلی صفحه
// ==========================================
export default function EmployerApplicationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useStore();

  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);
  const [activeDragApp, setActiveDragApp] = useState<ApplicationData | null>(null);

  // تنظیمات سنسورها برای پشتیبانی کامل از تاچ موبایل و موس
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // کاربر باید 5 پیکسل درگ کنه تا جابجایی شروع شه
      },
    })
  );

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('applications')
          .select(`
            id, status, created_at, job_seeker_id,
            jobs!inner (id, title, description, employer_id),
            profiles!applications_job_seeker_id_fkey (first_name, last_name, phone_number, job_title, skills)
          `)
          .eq('jobs.employer_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (data) {
          const formattedData: ApplicationData[] = data.map((app: any) => {
            const realMatchScore = calculateMatchScore(
              { job_title: app.profiles?.job_title, skills: app.profiles?.skills },
              { title: app.jobs?.title, description: app.jobs?.description }
            );

            return {
              id: app.id,
              applicantName: app.profiles?.first_name ? `${app.profiles.first_name} ${app.profiles.last_name}` : "کاربر بدون نام",
              applicantPhone: app.profiles?.phone_number || "", // گرفتن شماره برای اس ام اس
              jobTitle: app.jobs?.title || "نامشخص",
              date: new Date(app.created_at).toLocaleDateString('fa-IR'),
              matchScore: realMatchScore,
              status: app.status as ApplicationStatus,
              jobSeekerId: app.job_seeker_id,
              jobId: app.jobs?.id
            };
          });
          setApplications(formattedData);
        }
      } catch (err: any) {
        console.error("خطا در دریافت رزومه‌ها:", err);
        setError("خطایی در دریافت رزومه‌ها رخ داد. لطفاً صفحه را رفرش کنید.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user?.id, supabase]);

  // رویداد شروع جابجایی
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedApp = applications.find((app) => app.id === active.id);
    if (draggedApp) setActiveDragApp(draggedApp);
  };

  // رویداد پایان جابجایی (رها کردن کارت)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragApp(null);

    // اگر کارتی بیرون از ستون‌ها رها شد هیچ کاری نکن
    if (!over) return;

    const appId = active.id as string;
    const newStatus = over.id as ApplicationStatus;

    const targetApp = applications.find((app) => app.id === appId);
    if (!targetApp || targetApp.status === newStatus) return;

    const previousStatus = targetApp.status;

    // 1. آپدیت آنی UI (Optimistic Update)
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    // 2. آپدیت دیتابیس و ارسال پیامک
    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (updateError) throw updateError;

      // =========================================================
      // اجرای اتوماتیک ارسال پیامک دعوت به مصاحبه در پس‌زمینه
      // =========================================================
      if (newStatus === 'interview' && previousStatus !== 'interview') {
        if (targetApp.applicantPhone) {
          // نیازی به await نداریم چون نمیخوایم کارفرما منتظر بمونه
          fetch('/api/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: targetApp.applicantPhone,
              name: targetApp.applicantName,
              jobTitle: targetApp.jobTitle
            })
          }).catch(err => console.error("Error triggering SMS API:", err));
        }
      }

    } catch (err) {
      console.error("خطا در آپدیت وضعیت:", err);
      // برگرداندن به حالت قبل در صورت خطا
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: previousStatus } : app))
      );
      alert("خطا در تغییر وضعیت رزومه. لطفاً دوباره تلاش کنید.");
    }
  };

  const handleStartChat = async (app: ApplicationData) => {
    if (!user?.id) return;
    setIsStartingChat(app.id);

    try {
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('employer_id', user.id)
        .eq('job_seeker_id', app.jobSeekerId)
        .eq('job_id', app.jobId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingConv) {
        router.push('/employer/messages');
        return;
      }

      const { error: insertError } = await supabase
        .from('conversations')
        .insert({
          employer_id: user.id,
          job_seeker_id: app.jobSeekerId,
          job_id: app.jobId
        });

      if (insertError) throw insertError;
      router.push('/employer/messages');
      
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("خطا در برقراری ارتباط با سرور چت.");
    } finally {
      setIsStartingChat(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">در حال بارگذاری برد کانبان...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col animate-in fade-in duration-500">
      
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">مدیریت رزومه‌ها (ATS)</h1>
        <p className="mt-2 text-sm text-slate-500">
          برای تغییر وضعیت، کارت رزومه‌ها را بکشید و در ستون مورد نظر رها کنید. (هنگام انتقال به بخش "دعوت به مصاحبه" پیامک خودکار ارسال خواهد شد)
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* DND Context Wrap */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 flex-col gap-6 overflow-x-auto pb-4 lg:flex-row">
          {COLUMNS.map((column) => {
            const columnApps = applications.filter((app) => app.status === column.id);

            return (
              <DroppableColumn key={column.id} column={column} apps={columnApps}>
                {columnApps.map((app) => (
                  <DraggableItem 
                    key={app.id} 
                    app={app} 
                    handleStartChat={handleStartChat}
                    isStartingChat={isStartingChat} 
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeDragApp ? (
            <ApplicationCard app={activeDragApp} isOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}