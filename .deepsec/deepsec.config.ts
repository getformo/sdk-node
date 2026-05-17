import { defineConfig } from "deepsec/config";

export default defineConfig({
  projects: [
    { id: "sdk-node", root: ".." },
    // <deepsec:projects-insert-above>
  ],
});
