export const groupElementsByDay = (elements) => {
  const groupedElements = {};
  elements.forEach((activity) => {
    const createdDate = new Date(activity.created_at);
    const dayKey = createdDate.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    if (!groupedElements[dayKey]) {
      groupedElements[dayKey] = [];
    }
    groupedElements[dayKey].push(activity);
  });
  return groupedElements;
};

export function Hidden(props: { children }) {
  return null;
}

// Generate a formatted date
export function getFormattedDate(date) {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
