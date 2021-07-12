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
    // await encryptFileAndCreateReplacement('test.zip', 'asdasdasdsada');
    await decryptFileAndCreateReplacement('test-enc.zip', 'asdasdasdsada');

})();

openpgp.config.allowUnauthenticatedStream = true;


async function encryptFileSym(fileBuffer: Buffer, secret: string) {
  const message = await openpgp.createMessage({ binary: fileBuffer });
  return await openpgp.encrypt({
      message: message,
      passwords: [secret],
      armor: false,
  });
}

async function decryptFileSym(fileBuffer: Buffer, secret: string) {
  const message = await openpgp.readMessage({ binaryMessage: fileBuffer });
  return await openpgp.decrypt({
      message: message,
      passwords: [secret], // decrypt with password
      format: 'binary' // output as Uint8Array
  });
}

async function encryptFileAndCreateReplacement(filename: string, secret: string) {
  const newFileName = filename.split('.')[0] + "-enc.zip";

  const oldFileBuff = fs.readFileSync(filename);
  const encryptedData = await encryptFileSym(oldFileBuff, secret);
  fs.appendFileSync(newFileName, Buffer.from(encryptedData));
}

async function decryptFileAndCreateReplacement(filename: string, secret: string) {
  const newFileName = filename.replace("enc", "dec");

  const oldFileBuff = fs.readFileSync(filename);
  const encryptedData = await decryptFileSym(oldFileBuff, secret);
  fs.writeFileSync(newFileName, Buffer.from(encryptedData.data))
}
