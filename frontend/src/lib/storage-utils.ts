// Initial data structure for your Nexus Assistant
export const getNexusStats = () => {
  const docs = JSON.parse(localStorage.getItem("nexus_documents") || "[]");
  const chats = JSON.parse(localStorage.getItem("nexus_chats") || "[]");
  const actions = JSON.parse(localStorage.getItem("nexus_actions") || "[]");

  return [
    { title: "Documents", value: docs.length.toString(), change: `+${docs.length} total`, trend: "up" },
    { title: "Conversations", value: chats.length.toString(), change: "Active", trend: "up" },
    { title: "Agent Actions", value: actions.length.toString(), change: "Ready", trend: "up" },
    { title: "Avg Response", value: "1.2s", change: "Optimal", trend: "up" },
  ];
};

export const getRecentActivity = () => {
  return JSON.parse(localStorage.getItem("nexus_activity_log") || "[]").slice(0, 5);
};