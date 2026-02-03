import { useEffect } from "react";

export default function Seo(props: { title: string; description?: string }) {
  const { title, description } = props;

  useEffect(() => {
    document.title = title;
    const metaName = "description";
    let meta = document.querySelector(`meta[name="${metaName}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", metaName);
      document.head.appendChild(meta);
    }
    if (description) meta.setAttribute("content", description);
  }, [title, description]);

  return null;
}
