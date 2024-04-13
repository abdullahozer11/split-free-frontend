export const groupActivitiesByDay = (activities) => {
  const groupedActivities = {};
  activities.forEach((activity) => {
    const createdDate = new Date(activity.created_at);
    const dayKey = createdDate.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    if (!groupedActivities[dayKey]) {
      groupedActivities[dayKey] = [];
    }
    groupedActivities[dayKey].push(activity);
  });
  return groupedActivities;
};
