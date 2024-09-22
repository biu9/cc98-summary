const localKey = 'cc98-agent-count'

export const getCurrentCount = () => {
  const localStore = localStorage.getItem(localKey);
  if (localStore) {
    const json = JSON.parse(localStore);
    if (json.date === new Date().toLocaleDateString()) {
      return json.count;
    }
  }

  return 0;
}

export const increaseCurrentCount = () => {
  const currentCount = getCurrentCount();
  const currObj = {
    date: new Date().toLocaleDateString(),
    count: currentCount + 1,
  };
  localStorage.setItem(localKey, JSON.stringify(currObj));
}