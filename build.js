const path = require("path");
const AWS = require("aws-sdk");
const fs = require("fs");
const fsPromises = fs.promises;

const polly = new AWS.Polly();
const s3 = new AWS.S3();
const bucketName = "polly-voice-notes";
const notesDir = "notes";
const manifestFileKey = "manifest.json";

const pollyCommonParas = {
  OutputFormat: "mp3",
  VoiceId: "Matthew",
  OutputS3BucketName: bucketName
};
const s3CommonParas = {
  Bucket: bucketName
};

async function pollyTask(note, notes) {
  const filePath = path.join(notesDir, note);
  const content = await fsPromises.readFile(filePath);
  const result = await polly
    .startSpeechSynthesisTask({
      ...pollyCommonParas,
      Text: content.toString()
    })
    .promise();
  const taskId = result.SynthesisTask.TaskId;
  // We can periodically call `getSpeechSynthesisTask`
  //    to check whether the task is really completed successfully,
  //    but might be an overkill.
  notes.push({ name: note, key: `${taskId}.mp3` });
}

async function getNotesInS3() {
  try {
    const manifest = await s3
      .getObject({
        ...s3CommonParas,
        Key: manifestFileKey
      }).promise();
    const ret = JSON.parse(manifest.Body.toString());
    return ret.notes;
  } catch(e) {
    if (e.code !== "NoSuchKey") {
      throw e;
    }
  }
  return [];
}

async function getNotesInFs() {
  return await fsPromises.readdir(notesDir);
}

async function main() {
  const notes = await getNotesInS3();
  const noteSet = new Set(notes.map(d => d.name));
  const notesToProcess = (await getNotesInFs()).filter(d => !noteSet.has(d));

  await Promise.all(notesToProcess.map(n => pollyTask(n, notes)));

  await s3.putObject({
    ...s3CommonParas,
    Key: manifestFileKey,
    Body: JSON.stringify({ notes })
  }).promise();
}

main();
