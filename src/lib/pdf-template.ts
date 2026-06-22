import jsPDF from "jspdf";

const LOGO_URL = "/TathminiAfyaLogo.png";
const SIDEBAR_WIDTH = 6; // mm — thin blue right sidebar
const BRAND_BLUE: [number, number, number] = [59, 130, 246];

let cachedLogo: string | null = null;

async function loadLogo(): Promise<string | null> {
  if (cachedLogo) return cachedLogo;
  try {
    const res = await fetch(LOGO_URL);
    const blob = await res.blob();
    cachedLogo = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    return cachedLogo;
  } catch {
    return null;
  }
}

export type PdfTemplateOptions = {
  heading: string;
  description?: string;
};

/**
 * Creates a jsPDF doc with the standard Tathmini Afya template:
 *  - System name at top
 *  - Logo below
 *  - Heading + description
 *  - Thin blue right sidebar on every page (no text)
 * Returns the doc and the Y coordinate where body content should start.
 */
export async function createBrandedPdf(opts: PdfTemplateOptions): Promise<{ doc: jsPDF; startY: number }> {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const drawSidebar = () => {
    doc.setFillColor(...BRAND_BLUE);
    doc.rect(pageW - SIDEBAR_WIDTH, 0, SIDEBAR_WIDTH, pageH, "F");
  };

  // Sidebar on first page
  drawSidebar();

  // Hook subsequent pages (autoTable triggers addPage)
  const origAddPage = doc.addPage.bind(doc);
  (doc as any).addPage = (...args: any[]) => {
    const r = origAddPage(...args);
    drawSidebar();
    return r;
  };

  // System name (top)
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_BLUE);
  doc.setFontSize(22);
  doc.text("Tathmini Afya", pageW / 2, 16, { align: "center" });

  // Logo below the name
  const logo = await loadLogo();
  let y = 22;
  if (logo) {
    const w = 22;
    const h = 22;
    try {
      doc.addImage(logo, "PNG", (pageW - w) / 2, y, w, h);
      y += h + 4;
    } catch {
      y += 4;
    }
  } else {
    y += 4;
  }

  // Heading
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text(opts.heading, pageW / 2, y + 6, { align: "center" });
  y += 10;

  // Description / meta
  if (opts.description) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(opts.description, pageW - 28 - SIDEBAR_WIDTH);
    doc.text(lines, pageW / 2, y + 6, { align: "center" });
    y += 6 + lines.length * 5;
  }

  // Divider
  doc.setDrawColor(...BRAND_BLUE);
  doc.setLineWidth(0.5);
  doc.line(14, y + 4, pageW - SIDEBAR_WIDTH - 8, y + 4);

  // Reset text color for body
  doc.setTextColor(0, 0, 0);

  return { doc, startY: y + 10 };
}

export const PDF_SIDEBAR_WIDTH = SIDEBAR_WIDTH;
