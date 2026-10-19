
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const instant = false;

type Project = {
  id: number;
  title: string;
  slug: string;
  year: number | null;
  description: string | null;
  image: string | null;
  github_url: string | null;
  figma_url: string | null;
  live_url: string | null;
  drive_url: string | null;
  additional_url: string | null;
  roles: string[] | null;
  categories: string[] | null;
  tools: string[] | null;
};

type ProjectImage = {
  id: number;
  image_url: string;
  caption: string | null;
  sort_order: number | null;
  is_cover: boolean | null;
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load project.");
  }

  if (!project) {
    notFound();
  }

  const item = project as Project;

  const { data: images, error: imagesError } = await supabase
    .from("project_images")
    .select("id, image_url, caption, sort_order, is_cover")
    .eq("project_id", item.id)
    .order("sort_order", { ascending: true });

  if (imagesError) {
    console.error("Failed to load project images:", imagesError.message);
  }

  const gallery = (images ?? []) as ProjectImage[];

  const resources = [
    { label: "GitHub Repository", url: item.github_url },
    { label: "Figma Prototype", url: item.figma_url },
    { label: "Live Website", url: item.live_url },
    { label: "Google Drive", url: item.drive_url },
    { label: "Additional Resource", url: item.additional_url },
  ].filter(
    (resource) =>
      resource.url &&
      /^https?:\/\//i.test(resource.url)
  );

  return (
    <main className="wrap">
      <header className="nav">
        <Link className="brand" href="/">
          <span className="brand-icon">N</span> NEWI.
        </Link>
        <Link className="navlinks" href="/#projects">
          ← Back to projects
        </Link>
      </header>

      <section className="detail-hero">
        <span className="eyebrow">
          ✳ {(item.categories ?? []).join(" · ") || "PROJECT"}
        </span>

        <h1>{item.title}</h1>

        <p className="intro">
          {item.description || "A project made with curiosity."}
        </p>
      </section>

      <section className="meta-grid">
        <article className="paper-card yellow">
          <span className="kicker">MY ROLE</span>
          <p>{(item.roles ?? []).join(" · ") || "Contributor"}</p>
        </article>

        <article className="paper-card lavender">
          <span className="kicker">YEAR</span>
          <p>{item.year ?? "Not specified"}</p>
        </article>

        <article className="paper-card blue">
          <span className="kicker">TOOLS</span>
          <p>{(item.tools ?? []).join(", ") || "Not specified"}</p>
        </article>
      </section>

      {item.image && (
        <section>
          <span className="kicker">PROJECT COVER</span>
          <div className="detail-cover">
            <img src={item.image} alt={`${item.title} cover`} />
          </div>
        </section>
      )}

      <section>
        <span className="kicker">THE BACKSTORY</span>
        <h2>What&apos;s the project about?</h2>
        <p className="detail-description">
          {item.description || "Project description coming soon."}
        </p>
      </section>

      {gallery.length > 0 && (
        <section>
          <span className="kicker">A CLOSER LOOK</span>
          <h2>Bits & pieces 📸</h2>

          <div className="gallery">
            {gallery.map((photo) => (
              <figure key={photo.id}>
                <img
                  src={photo.image_url}
                  alt={photo.caption || item.title}
                />
                {photo.caption && (
                  <figcaption>{photo.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      <section>
        <span className="kicker">MY TOOLBOX</span>
        <h2>Tools I used 🧰</h2>
        <div className="tools">
          {(item.tools ?? []).map((tool) => (
            <span className="tool" key={tool}>
              {tool}
            </span>
          ))}
        </div>
      </section>

      {resources.length > 0 && (
        <section>
          <span className="kicker">EXPLORE FURTHER</span>
          <h2>Links & resources ↗</h2>

          <div className="link-list">
            {resources.map((resource) => (
              <a
                className="resource"
                key={resource.label}
                href={resource.url!}
                target="_blank"
                rel="noopener noreferrer"
              >
                {resource.label} ↗
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        <Link href="/#projects">← Explore more projects</Link>
      </footer>
    </main>
  );
}
