import NoticeBoard from '@/components/NoticeBoard';
import ChatWidget from '@/components/ChatWidget'; // Import the new component

// 예시 데이터 from NoticeBoard.example.tsx
const sampleNotices = [
  {
    id: 1,
    title: "시설 점검으로 인한 일시 출입 제한 안내",
    category: "안전공지",
    priority: "urgent" as const,
    date: "2024.01.10",
    content: "2024년 1월 15일 오전 2시부터 6시까지 시설 점검이 진행됩니다. 해당 시간대에는 출입이 제한되오니 양해 부탁드립니다. 긴급상황 시 비상연락처(02-1234-5678)로 연락주시기 바랍니다."
  },
  {
    id: 2,
    title: "새로운 안전장비 착용 의무화",
    category: "안전규정",
    priority: "important" as const,
    date: "2024.01.09",
    content: "2024년 1월 20일부터 새로운 안전장비 착용이 의무화됩니다. 모든 직원은 반드시 지급받은 안전장비를 착용하고 작업에 임해주시기 바랍니다."
  },
  {
    id: 3,
    title: "2024년 신년회 개최 안내",
    category: "사내공지",
    priority: "normal" as const,
    date: "2024.01.08",
    content: "2024년 신년회가 1월 25일 오후 6시에 회사 대강당에서 열립니다. 많은 참여 부탁드리며, 참석 여부는 1월 20일까지 인사팀에 전달해 주시기 바랍니다."
  },
  {
    id: 4,
    title: "임금협상 결과 및 단체협약 체결 안내",
    category: "노조소식",
    priority: "important" as const,
    date: "2024.01.07",
    content: "2024년 임금협상이 완료되어 새로운 단체협약이 체결되었습니다. 주요 내용은 기본급 3% 인상, 복리후생 개선 등이며, 자세한 사항은 노조 게시판을 참고해 주시기 바랍니다."
  },
  {
    id: 5,
    title: "화재예방을 위한 정기점검 실시",
    category: "안전공지",
    priority: "normal" as const,
    date: "2024.01.06",
    content: "매월 첫째 주 화요일마다 화재예방을 위한 정기점검을 실시합니다. 점검 시간은 오전 9시부터 11시까지이며, 해당 시간에는 소음이 발생할 수 있습니다."
  }
];

export default function HomePage() {
  return (
    <main>
      <NoticeBoard notices={sampleNotices} />
      <ChatWidget />
    </main>
  );
}
