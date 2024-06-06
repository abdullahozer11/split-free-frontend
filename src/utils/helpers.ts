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
  return date?.toLocaleDateString('en-US', options);
}

import * as FileSystem from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { supabase } from '@/src/lib/supabase';
import { decode } from 'base64-arraybuffer';

export const uploadImage = async (image) => {
  if (!image?.startsWith('file://')) {
    return;
  }

  const base64 = await FileSystem.readAsStringAsync(image, {
    encoding: 'base64',
  });
  const filePath = `${randomUUID()}.png`;
  const contentType = 'image/png';

  const { data, error } = await supabase.storage
    .from('expense-proof-images')
    .upload(filePath, decode(base64), { contentType });

  console.log("Error while uploading", error);

  if (data) {
    return data.path;
  }
};

export function findArrayDiff(array1, array2) {
    const added = [];
    const subtracted = [];

    // Find added numbers
    array2.forEach(num => {
        if (!array1.includes(num)) {
            added.push(num);
        }
    });

    // Find subtracted numbers
    array1.forEach(num => {
        if (!array2.includes(num)) {
            subtracted.push(num);
        }
    });

    return { added, subtracted };
}

export function formatDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatDateString(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
