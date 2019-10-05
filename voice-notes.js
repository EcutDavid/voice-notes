// TODO: use dependency injection for AWS stuff.
const AWS = require("aws-sdk");

AWS.config.update({ region: "ap-southeast-2" });
const polly = new AWS.Polly();
const s3 = new AWS.S3();
const bucketName = "voice-notes-app";
const manifestFileKey = "manifest.json";

const pollyCommonParas = {
  OutputFormat: "mp3",
  VoiceId: "Matthew",
  OutputS3BucketName: bucketName
};
const s3CommonParas = {
  Bucket: bucketName
};

async function createVoiceNote(title, content, userId) {
  // TOOD: improve as this bad logic means only one createVoiceNote can happen at a time.
  const notes = await getNotesInS3();

  const result = await polly
    .startSpeechSynthesisTask({
      ...pollyCommonParas,
      Text: content
    })
    .promise();

  const taskId = result.SynthesisTask.TaskId;
  // TODO: periodically call `getSpeechSynthesisTask`
  // to check whether the task is really completed successfully,
  // and return the result only after that.
  notes.push({ name: title, key: `${taskId}.mp3`, userId: userId });
  console.log("Successfully sent a Polly task for ", title, "at:", new Date());

  await s3
    .putObject({
      ...s3CommonParas,
      Key: manifestFileKey,
      Body: JSON.stringify({ notes })
    })
    .promise();
}

async function getNotesInS3() {
  try {
    const manifest = await s3
      .getObject({
        ...s3CommonParas,
        Key: manifestFileKey
      })
      .promise();
    const ret = JSON.parse(manifest.Body.toString());
    return ret.notes;
  } catch (e) {
    if (e.code !== "NoSuchKey") {
      throw e;
    }
  }
  return [];
}

module.exports.createVoiceNote = createVoiceNote;
