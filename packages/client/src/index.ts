import * as fs from 'fs';
// import { addNote55 } from '../../vue/src/db/courseDB';
// import PouchDb from 'pouchdb-core';
import console from 'console';
import Blob from 'buffer';
import axios from 'axios';
// import { addNote55 } from 'new-skuilder';

// const spellingCourseID = 'a9fae15687220aa6ce62018005087c95';
// testAPI();

makeSpellingNotes();
makeSelectionNotes();

// createCard();

function makeSelectionNotes() {
  // todo
  // 1. get all the words
  // 2. batch groups w/ low hamming distance ... ?
  // 3. create notes
  // 4. tag according to hamming diff (eg, what is the target phoneme different than given alternatives)
}

testAPI();

function testAPI() {
  // works!
  axios.get('https://eduquilt.com/express').then((res) => {
    console.log(res);
  });
}

function isCVCword(w: string): boolean {
  if (w.length != 3) return false;

  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const consonants = 'bcdfghjklmnpqrstvwxyz'.split('');

  const first = w[0];
  const second = w[1];
  const third = w[2];

  return (
    consonants.includes(first) &&
    vowels.includes(second) &&
    consonants.includes(third)
  );
}

function isCVCeWord(w: string): boolean {
  if (w.length != 4) return false;

  const last = w[3];
  if (last !== 'e') return false;

  return isCVCword(w.slice(0, 3));
}

function cardText(w: string): string {
  return `Spell the word:
  
{{ ${w} }}`;
}

function spellingCardTags(w: string): string[] {
  const ret = ['spelling'];

  if (isCVCword(w)) {
    ret.push('CVC');
    const vowel = w[1];
    ret.push(`CVC-${vowel}`);
    ret.push(`short-${vowel}`);
  }

  if (isCVCeWord(w)) {
    ret.push('CVCe');
    const vowel = w[1];
    ret.push(`CVCe-${vowel}`);
    ret.push(`long-${vowel}}`);
  }

  return ret;
}

// async function createCard() {
//   // get request
//   const req = http.request(
//     {
//       method: 'POST',
//       host: 'eduquilt.com',
//       port: 3000,
//       path: '/express',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       auth: 'colin:colin', // todo
//       username: 'colin',
//       password: 'colin',
//     },
//     (res) => {
//       if (res.statusCode !== 200) {
//         console.warn(`Request failed with status code ${res.statusCode}`);
//       }
//       console.error(res);
//     }
//   );
//   const data = JSON.stringify({
//     request: 'getCourse',
//     courseID: spellingCourseID,
//   });
//   req.write(data);
// }

type spellingNote = {
  md: string;
  audio: Blob.Blob;
  tags: string[];
};

function makeSpellingNotes(): spellingNote[] {
  const ret: spellingNote[] = [];

  const recordingsDir = '/home/colin/dev/eqrecordings';
  const recordings = fs.readdirSync(recordingsDir);
  recordings.sort((a, b) => a.length - b.length);

  recordings.forEach((recording) => {
    const word = recording.split('.')[0];
    const ext = recording.split('.')[1];

    if (
      word.length > 1 && // omit letters
      ext === 'mp3'
    ) {
      // exec(`xdg-open ${recordingsDir + '/' + recording}`); // works

      const card = cardText(word);
      const tags = spellingCardTags(word);

      if (isCVCword(word)) {
        console.log(`CVC word: ${word}`);

        console.log(card);
      }
      if (isCVCeWord(word)) {
        console.log(`CVCe word: ${word}`);
      }
      const note = {
        md: card,
        audio: fs.readFileSync(recordingsDir + '/' + recording),
        tags: tags,
      };
      // ret.push(note);

      console.log(note);
      console.log(card);
      console.log(tags);
    }

    // fs.writeFileSync(`./src/spelling/${word}.md`, `# ${word}`);
  });
  return ret;
}
