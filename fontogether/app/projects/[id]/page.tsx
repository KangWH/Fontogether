import GlyphsView from "./aaaa";

export async function generateStaticParams() {
  const result = Array.from({ length: 500 }, (_, i) => ({ id: i.toString() }));
  return result;
}

export default function View() {
  return <GlyphsView />
}