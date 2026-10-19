
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProjectFilters from "./components/Projects/ProjectFilters";

export const instant = false;

type Project = {
  id: number;
  title: string;
  slug: string;
  year: number | null;
  description: string | null;
  image: string | null;
  roles: string[] | null;
  categories: string[] | null;
  tools: string[] | null;
  featured: boolean | null;
};

export default async function HomePage() {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, slug, year, description, image, roles, categories, tools, featured"
    )
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as Project[];

  if (error) {
    console.error("Failed to load projects:", error.message);
  }

  return (
    <>
      <header className="wrap nav">
        <Link className="brand" href="#home">
          <span className="brand-icon">N</span> NEWI.
        </Link>

        <nav className="navlinks">
          <a href="#about">About</a>
          <a href="#tools">Tools</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Say hi ↗</a>
        </nav>
      </header>

      <main>
        
        {/* HERO */}
        <section className="hero wrap" id="home">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">
                ✳ SOFTWARE ENGINEERING STUDENT
              </span>

              <h1>
                Hi, I&apos;m
                <br />
                <span className="highlight">Newi!</span> Nice
                <br />
                to meet ya.
              </h1>

              <p className="intro">
                I make things, break things, and learn a lot in
                between. I&apos;m exploring software development,
                data, and design — figuring out how to turn messy
                ideas into useful things.
              </p>

              <div className="actions">
                <a className="btn primary" href="#projects">
                  Explore my work ↘
                </a>
                <a className="btn" href="#contact">
                  Let&apos;s connect ↗
                </a>
              </div>
            </div>

            <div className="hero-art">
              <div className="portrait">
                <img src="/profil.jpg" alt="Newi's portrait" />
              </div>

              <span className="sticker one">
                currently learning ✍
              </span>
              <span className="sticker two">
                data curious ↗
              </span>

              <span className="spark a">✳</span>
              <span className="spark b">✦</span>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="wrap" id="about">
          <div className="section-head">
            <div>
              <span className="kicker">A LITTLE ABOUT ME</span>
              <h2>Curious by default.</h2>
            </div>
          </div>

          <div className="about-grid">
            <article className="paper-card about-card blue">
              <h3>More than just the code.</h3>
              <p>
                I&apos;m a Software Engineering student who enjoys
                understanding how things work — from building
                interfaces to exploring what data can tell us.
                I like trying things out, asking questions, and
                learning as I go.
              </p>
            </article>

            <article className="paper-card edu-card lavender">
              <h3>Currently studying 🎓</h3>
              <div className="edu-line">
                <strong>IPB University</strong>
                <strong>2023 — now</strong>
              </div>
              <p className="small">
                Software Engineering · Applied Bachelor&apos;s (D4)
                <br />
                Interested in Data Analyst, Business Analyst,
                and building thoughtful software.
              </p>
            </article>
          </div>
        </section>

        {/* TOOLS */}
        <section className="wrap" id="tools">
          <div className="section-head">
            <div>
              <span className="kicker">MY TOOLBOX</span>
              <h2>Tools I&apos;ve tried 🧰</h2>
            </div>
          </div>

          <div className="tools">
            {[
              "Python",
              "Pandas",
              "NumPy",
              "Scikit-learn",
              "SQL / MySQL",
              "PHP",
              "Laravel",
              "JavaScript",
              "Vue.js",
              "HTML & CSS",
              "Figma",
              "Git & GitHub",
              "Google Colab",
              "Draw.io",
              "Android Studio",
            ].map((tool) => (
              <span className="tool" key={tool}>
                {tool}
              </span>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section className="projects-section" id="projects">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="kicker">
                  THINGS I&apos;VE WORKED ON
                </span>
                <h2>Some projects, some lessons.</h2>
              </div>

              <span className="eyebrow">
                made with curiosity ✷
              </span>
            </div>

            {error ? (
              <p>
                Projects couldn&apos;t be loaded. Check your
                Supabase connection and database permissions.
              </p>
            ) : projects.length === 0 ? (
              <p>
                No projects yet. Add your first project in
                Supabase!
              </p>
            ) : (
              <ProjectFilters projects={projects} />
            )}
          </div>
        </section>

        {/* CONTACT */}
        <section className="wrap" id="contact">
          <div className="contact-box">
            <div>
              <span className="kicker">GOT A COOL IDEA?</span>
              <h2>
                Let&apos;s make
                <br />
                something good.
              </h2>
              <p>
                Open to learning, collaborating, and chatting
                about software, data, or anything interesting.
              </p>
            </div>

            <a
              className="btn"
              href="mailto:YOUR_EMAIL@example.com"
            >
              Get in touch ↗
            </a>
          </div>
        </section>
      </main>

      <footer className="wrap footer">
        <span>© 2026 Newi Muchlisinia</span>
        <span>Made with curiosity & a little chaos ✳</span>
        <a href="#home">Back to top ↑</a>
      </footer>
    </>
  );
}
