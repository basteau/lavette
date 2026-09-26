import { onMounted } from "vue";

/** Fragment navigation can run before an asynchronously loaded section exists, and each
 * section that loads later shifts the ones below it, so every async section re-applies it. */
export function useHashTarget() {
  onMounted(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  });
}
