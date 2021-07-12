// encrypt-file.js
import * as openpgp from 'openpgp'
import fs from 'fs'

// DO NOT show versions OR comments in output files
// openpgp.config.showVersion = false;
// openpgp.config.showComment = false;
// openpgp.config.allowUnauthenticatedStream = true;

(async () => {
  let { privateKeyArmored, publicKeyArmored, revocationCertificate } =
    await openpgp.generateKey({
      type: "ecc", // Type of the key, defaults to ECC
      curve: "curve25519", // ECC curve name, defaults to curve25519
      userIDs: [{ name: "Jon Smith", email: "jon@example.com" }], // you can pass multiple user IDs
      passphrase: "super long and hard to guess secret", // protects the private key
    });

    // For POC I don't use Keys for the moment, only password
    await encryptFileAndCreateReplacement('test.zip', 'asdasdasdsada');
    await decryptFileAndCreateReplacement('test-enc.zip', 'asdasdasdsada');

})();

openpgp.config.allowUnauthenticatedStream = true;


async function encryptFileSym(fileBuffer: fs.ReadStream, secret: string) {
  const message = await openpgp.createMessage({ text: fileBuffer, type: 'binary' });
  return await openpgp.encrypt({
      message: message,
      passwords: [secret],
      armor: false, 
  });
}

async function decryptFileSym(fileBuffer: fs.ReadStream, secret: string) {
  const message = await openpgp.readMessage({ armoredMessage: fileBuffer });
  return await openpgp.decrypt({
      message: message,
      passwords: [secret], // decrypt with password
      format: 'binary' // output as Uint8Array
  });

}

async function encryptFileAndCreateReplacement(filename: string, secret: string) {
  const newFileName = filename.split('.')[0] + "-enc.zip";
  const oldFileBuff = fs.createReadStream(filename);
  const encryptedData = await encryptFileSym(oldFileBuff, secret);
  const newFileStream = fs.createWriteStream(newFileName);
  encryptedData.pipe(newFileStream);
}

async function decryptFileAndCreateReplacement(filename: string, secret: string) {
  const newFileName = filename.replace("enc", "dec");
  //delete the old file
  //delete the encrypted secret file
  const oldFileBuff = fs.createReadStream(filename);
  const decryptedData = await decryptFileSym(oldFileBuff, secret);
  const newFileStream = fs.createWriteStream(newFileName);
  decryptedData.data.pipe(newFileStream);
}


// Not used data, examples....

// (async function () {
//   await encryptFileAndCreateReplacement("test.txt", "helloworld");
//   await decryptFileAndCreateReplacement("test.enc", "helloworld");
// })();



// async function encryptFileSym(fileBuffer: fs.ReadStream, secret: string) {
//   const oldFileBuff = fs.createReadStream('test.txt');
//   const message = await openpgp.createMessage({ text: <fs.ReadStream>fileBuffer });
//   return await openpgp.encrypt({
//       message,
//       passwords: secret,
//       armor: false, 
//   });
// }
// async function decryptFileSym(fileBuffer: fs.ReadStream, secret: string) {
//   const message = await openpgp.readMessage({ armoredMessage: fileBuffer });
//   return await openpgp.decrypt({
//       message,
//       passwords: secret,
//   });
// }




// const publicKeyArmored = fs.readFileSync('./public.key', {
//   encoding: 'utf8',
//   flag: 'r'
// });
// (async () => {
//   const plainData = fs.readFileSync('secret.txt');
//   const encrypted = await openpgp.encrypt({
//     message: openpgp.message.fromText(plainData),
//     publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys
//   });
//   fs.writeFileSync('encrypted-secret.txt', encrypted.data);
//   console.log(`data has been encrypted...`);
// })();


// async function encrypt1() {
//   const data = await fs.createReadStream("test.txt")
//   const encrypted = await openpgp.encrypt({
//     message: openpgp.createMessage.(
//       new Uint8Array([0x01, 0x01, 0x01])
//     ),
//     publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys,
//   });
//   let readStream = encrypted.data;
//   let writeStream = fs.createWriteStream("encrypted-test.txt", {
//     flags: "a",
//   });
//   readStream.pipe(writeStream);
//   readStream.on("end", () => console.log("done!"));
// }

// async function encrypt() {
//   const plainData = fs.readFileSync("test.txt");
//   const encrypted = await openpgp.encrypt({
//     message: openpgp.message.fromText(plainData),
//     publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys,
//   });

//   fs.writeFileSync("encrypted-test.txt", encrypted.data);
// }

// encrypt();
