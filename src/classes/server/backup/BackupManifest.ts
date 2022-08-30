import fs from "fs";
import path from "path";
import { CompressionType } from "./BackupManager";

export enum BackupType {
  Manual = "manual",
  Automatic = "auto"
}

interface BackupManifest {
  version: number
  backups: AutoOrManualBackupMetadata[]
}

export interface BackupMetadata {
  id: string
  created: string
  compression: CompressionType
  type: BackupType
}

export interface AutoBackupMetadata extends Omit<BackupMetadata, "type"> {
  type: BackupType.Automatic
}

export interface ManualBackupMetadata extends Omit<BackupMetadata, "type"> {
  name: string
  desc: string
  author: string
  type: BackupType.Manual
}
export type AutoOrManualBackupMetadata = AutoBackupMetadata | ManualBackupMetadata;


export class BackupManifestController {
  readonly version = 1;

  protected manifest: BackupManifest
  readonly dest: string
  readonly filepath: string
  constructor(dest: string) {
    this.dest = dest;
    this.filepath = path.join(dest, "manifest.json");

    try {
      this.manifest = this.readSync();
    }catch(err) {
      this.manifest = { version: this.version, backups: [] }; 
    }
  }


  read = async() => JSON.parse(await fs.promises.readFile(this.filepath, { encoding: "utf8" })) as BackupManifest;
  readSync = () => JSON.parse(fs.readFileSync(this.filepath, { encoding: "utf8" })) as BackupManifest;

  write = async() => await fs.promises.writeFile(this.filepath, this.toString(), { encoding: "utf8" });
  writeSync = () => fs.writeFileSync(this.filepath, this.toString(), { encoding: "utf8" });

  addAuto = (backup: AutoBackupMetadata) => this.manifest.backups.push(backup);
  addManual = (backup: ManualBackupMetadata) => this.manifest.backups.push(backup);
  add = (backup: AutoOrManualBackupMetadata) => this.manifest.backups.push(backup);

  remove = (id: string) => this.manifest.backups = this.manifest.backups.filter(meta => meta.id != id);

  get = (id: string) => this.manifest.backups.find(meta => meta.id == id);

  private getLatestOrOldest(direction: "latest" | "oldest", type?: BackupType) {
    let closestEpoch = direction == "latest" ? -1 : Infinity, closest;
    for (let i = 0; i < this.manifest.backups.length; i++) {
      const backup = this.manifest.backups[i];
      if (backup.type != type) continue;

      const epoch = new Date(backup.created).getTime();
      const isCloser = direction == "latest" ? epoch > closestEpoch : epoch < closestEpoch;

      if (isCloser) {
        closestEpoch = epoch;
        closest = backup;
      }
    }
    return closest;
  }
  getLatest = () => this.getLatestOrOldest("latest");
  getLatestManual = () => this.getLatestOrOldest("latest", BackupType.Manual) as ManualBackupMetadata | undefined;
  getLatestAutomatic = () => this.getLatestOrOldest("latest", BackupType.Automatic) as AutoBackupMetadata | undefined;

  getOldest = () => this.getLatestOrOldest("oldest");
  getOldestManual = () => this.getLatestOrOldest("oldest", BackupType.Manual) as ManualBackupMetadata | undefined;
  getOldestAutomatic = () => this.getLatestOrOldest("oldest", BackupType.Automatic) as AutoBackupMetadata | undefined;

  getAllSortedByDate(direction: "latestFirst" | "oldestFirst" = "latestFirst") {
    const sorted = this.manifest.backups.sort((a, b) => {
      const aEpoch = new Date(a.created).getTime();   
      const bEpoch = new Date(b.created).getTime();
      return bEpoch - aEpoch;
    });
    if (direction == "latestFirst") return sorted;
    return sorted.reverse();
  }

  getByName(name: string) {
    return this.manifest.backups.find(meta => {
      if (meta.type == BackupType.Manual) {
          return meta.name == name;
      }
      return false;
    }) as ManualBackupMetadata | undefined;
  }

  getAllManual = () => this.manifest.backups.filter(meta => meta.type == BackupType.Manual) as ManualBackupMetadata[];
  getAllAutomatic = () => this.manifest.backups.filter(meta => meta.type == BackupType.Automatic) as AutoBackupMetadata[];

  // TODO: add getByProperty

  // getByProperty<T extends keyof ManualBackupMetadata>(property: T, value: ManualBackupMetadata[T]) {
  //   return this.manifest.backups.filter(meta => meta.hasOwnProperty(property));
  // }

  get backups() {
    return this.manifest.backups;
  }

  get backupCount() {
    return this.manifest.backups.length;
  }

  toString() {
    return JSON.stringify(this.manifest, null, 2);
  }
}