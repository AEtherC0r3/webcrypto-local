import { setEngine } from "2key-ratchet";
import { Crypto } from "@peculiar/webcrypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { IServerOptions } from "../../../index";
import { LocalServer } from "../../local";

// Set crypto engine for 2key-ratchet
setEngine("WebCrypto NodeJS", new Crypto());

const APP_DATA_DIR = path.join(os.homedir(), ".fortify");
const CERT_FILE = path.join(APP_DATA_DIR, "cert.pem");
const KEY_FILE = path.join(APP_DATA_DIR, "key.pem");

const SERVER_ADDRESS = "127.0.0.1:31337";

const options: IServerOptions = {
    cert: fs.readFileSync(CERT_FILE),
    key: fs.readFileSync(KEY_FILE),
    config: {
        // cards: path.join(__dirname, "..", "..", "..", ".fortify", "card.json"),
        cards: path.join(__dirname, "..", "..", "..", "json", "card.json"),
        providers: [
            { lib: "/usr/local/lib/softhsm/libsofthsm2.so", slots: [0], name: "Custom name" },
            {
                lib: "/usr/local/Cellar/nss/3.36.1/lib/libsoftokn3.dylib",
                slots: [1],
                libraryParameters: "configdir='sql:/Users/microshine/Library/Application Support/Firefox/Profiles/7132ve7i.default' certPrefix='' keyPrefix='' secmod='secmod.db' flags=optimizeSpace updatedir='' updateCertPrefix='' updateKeyPrefix='' updateid='' updateTokenDescription=''  manufacturerID='Mozilla.org' libraryDescription='Внутрен. крипто PSM' cryptoTokenDescription='Общ. криптослужбы' dbTokenDescription='Модуль защиты' cryptoSlotDescription='Внутренние криптослужбы PSM' dbSlotDescription='Закрытые ключи PSM' FIPSSlotDescription='FIPS 140 Службы крипто, ключей, сертиф.' FIPSTokenDescription='Модуль защиты (FIPS)' minPS=0",
                name: "Firefox NSS",
            },
        ],
    },
};
const server = new LocalServer(options);

server.listen(SERVER_ADDRESS)
    .on("listening", (e: any) => {
        console.log(`${e}`);
    })
    .on("info", (msg) => {
        console.log(msg);
    })
    .on("token_new", (card) => {
        console.log("New token:", card);
    })
    .on("error", (e: Error) => {
        console.error(e);
    })
    .on("notify", (p: any) => {
        console.log("Notify:", p.type);

        switch (p.type) {
            case "2key": {
                // auto approve all connections
                p.resolve(true);
                break;
            }
            case "pin": {
                // auto PIN for all token's
                // p.resolve("12345");
                p.resolve("12345678");
                break;
            }
            default:
                throw new Error("Unknown type of notify");
        }
    })
    .on("close", (e: any) => {
        console.log("Close:", e.remoteAddress);
    });
