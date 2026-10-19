
"use client";

import { useState } from "react";
import Link from "next/link";

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

const filters = [
  "Everything",
  "Frontend",
  "Backend",
  "Data Analyst",
  "System Analyst",
  "UI/UX",
  "Model Training",
];

export default function ProjectFilters({
  projects,
}: {
  projects: Project[];
}) {
  const [active, setActive] = useState("Everything");

  const filteredProjects = projects.filter((project) => {
    if (active === "Everything") return true;

    const values = [
      ...(project.roles ?? []),
      ...(project.categories ?? []),
    ];

    return values.some(
      (value) => value.toLowerCase() === active.toLowerCase()
    );
  });

  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`filter ${active === filter ? "active" : ""}`}
            onClick={() => setActive(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="project-grid">
        {filteredProjects.map((project, index) => (
          <Link
            className="project"
            href={`/projects/${project.slug}`}
            key={project.id}
          >
            <div className={`project-cover cover-${index % 6}`}>
              {project.image ? (
                <img src={project.image} alt={project.title} />
              ) : (
                <span className="project-symbol">
                  {project.title.slice(0, 5)}
                </span>
              )}

              <span className="cover-tag">
                {project.featured
                  ? "FEATURED ✦"
                  : `${String(index + 1).padStart(2, "0")} / PROJECT`}
              </span>
            </div>

            <div className="project-body">
              <h3>{project.title}</h3>

              <p>
                {project.description ??
                  "A little project made with curiosity."}
              </p>

              <div className="tags">
                {(project.tools ?? []).slice(0, 3).map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>

              <span className="project-link">
                View project details ↗
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <p>No projects found in this category just yet.</p>
      )}
    </>
  );
}
