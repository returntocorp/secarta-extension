import { ExtractedRepoSlug } from "@r2c/extension/utils";
import { FindingEntry } from "./findings";

export function permissionsUrl(repoSlug: ExtractedRepoSlug) {
  const { domain, org, repo } = repoSlug;

  return `https://api.secarta.io/v1/permissions/${domain}/${org}/${repo}`;
}

export interface PermissionEntry {
  name: string;
  displayName: string;
  found: boolean;
  locations: FindingEntry[];
}

export interface PermissionsResponse {
  gitUrl: string;
  commitHash: string;
  permissions: {
    [name: string]: PermissionEntry;
  };
}
