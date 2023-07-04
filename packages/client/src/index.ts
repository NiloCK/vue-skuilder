import * as fs from 'fs';
// import { addNote55 } from '../../vue/src/db/courseDB';
// import PouchDb from 'pouchdb-core';
import console from 'console';
// import { addNote55 } from 'new-skuilder';

makeSpellingNotes();
makeSelectionNotes();

hitAPI();

function makeSelectionNotes() {
  // todo
  // 1. get all the words
  // 2. batch groups w/ low hamming distance ... ?
  // 3. create notes
  // 4. tag according to hamming diff (eg, what is the target phoneme different than given alternatives)
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

function hitAPI() {
  const url = 'http://eduquilt.com/express';
  // get request

  fetch(url).then((res) => {
    console.log(JSON.stringify(res));
  });
}

function makeSpellingNotes() {
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

      console.log(card);
      console.log(tags);
    }
    // fs.writeFileSync(`./src/spelling/${word}.md`, `# ${word}`);
  });

  // addNote55(
  //   'courseID', // todo
  //   'codeCourse', // todo
  //   'shape', // todo
  //   'data', // (includes audio + markdown of spelling card)
  //   'Colin', // author,
  //   ['spelling', 'todo']
  //   // { Uploads: null }
  // );
}
