/**
 * @file context-manager.ts
 * @description Manages and generates contextual prompts for the Gemini API.
 */

// --- Type Definitions ---

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  priority: 'important' | 'normal';
}

/**
 * Represents all possible contextual information that can be sent to the AI.
 * This is a union of different context types for different use cases.
 */
export interface ContextInfo {
  // For the main chat widget
  announcements?: Announcement[];

  // For the dedicated PDF chat page
  driveFileId?: string;
  fileName?: string;
  currentPage?: number;
  totalPages?: number;
  selectedText?: string;
}

/**
 * Generates a structured prompt for the Gemini API based on the provided context.
 * It intelligently constructs the prompt based on the available context fields.
 */
export const generateContextPrompt = (message: string, context: ContextInfo): string => {
  let contextPrompt = `You are an intelligent Korean safety assistant for a company, named \"안전이\".

Your instructions are:
1. Analyze the user's question to determine its intent.
2. If the question is about a **Company Announcement**, use that information to answer.
3. If the question is about a **PDF document**, you MUST state that you cannot read the file's content directly. Then, you MUST politely guide the user to the PDF viewer page by saying: \"PDF 자료는 직접 읽을 수 없지만, 모든 안전 문서를 볼 수 있는 PDF 자료실 페이지로 안내해 드릴 수 있습니다. 이동하시겠어요?\" Do NOT provide the /pdf-chat path directly.
4. If the question is general and **not related** to company announcements or PDF documents, answer it using your own general knowledge as a helpful safety assistant. Do NOT mention announcements or PDF documents if the question is not about them.

Provide your answer in Korean.

`;

  const contextParts: string[] = [];

  // Context for the main chat widget (announcements)
  if (context.announcements && context.announcements.length > 0) {
    const announcementsText = context.announcements
      .map(a => `- (중요도: ${a.priority}) ${a.title}: ${a.content}`)
      .join('\n');
    contextParts.push('**[Context Source: Company Announcements]**\n' + announcementsText);
  }

  // Context for the dedicated PDF chat page
  if (context.fileName && context.driveFileId) {
    contextParts.push(`- Document Name: ${context.fileName}`);
    if (context.currentPage) {
      let pageInfo = `- Current Page: ${context.currentPage}`;
      if (context.totalPages) {
        pageInfo += ` of ${context.totalPages}`;
      }
      contextParts.push(pageInfo);
    }
    if (context.selectedText) {
      const truncatedText = context.selectedText.length > 500
        ? `${context.selectedText.substring(0, 500)}...`
        : context.selectedText;
      contextParts.push(`- Selected Text from Document: \"${truncatedText}\"`);
    }
  }

  if (contextParts.length > 0) {
    contextPrompt += "--- START OF CONTEXT ---\n";
    contextPrompt += contextParts.join('\n\n');
    contextPrompt += "\n--- END OF CONTEXT ---\n\n";
  }

  contextPrompt += `--- USER'S QUESTION ---
${message}
-----------------------

`;
  contextPrompt += "Based on your instructions and the provided context, please provide a clear and helpful answer in Korean.";

  return contextPrompt;
};
