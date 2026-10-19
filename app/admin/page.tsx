
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import AdminLogoutButton from "../components/AdminLogoutButton";
import { connection } from "next/server";

export const instant = false;

export default async function AdminPage() {
      await connection();

  // Buat Supabase client dengan sesi dari cookies
  const supabase = await createSupabaseServerClient();

  // Cek sesi login admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Ambil data project
  const {
    data: projects,
    error: projectsError,
  } = await supabase
    .from("projects")
    .select("id, title, slug, year, featured, created_at")
    .order("created_at", { ascending: false });

  // Ambil total kunjungan
  const {
    count: totalViews,
    error: viewsError,
  } = await supabase
    .from("website_visits")
    .select("*", { count: "exact", head: true });

  // Ambil visitor ID untuk menghitung pengunjung unik
  const {
    data: visits,
    error: visitorsError,
  } = await supabase
    .from("website_visits")
    .select("visitor_id");

  const uniqueVisitors = new Set(
    (visits ?? [])
      .map((visit) => visit.visitor_id)
      .filter(Boolean)
  ).size;

  // Debug: lihat hasilnya di terminal
  console.log("TOTAL VIEWS:", totalViews);
  console.log("VISITS:", visits);
  console.log("VIEWS ERROR:", viewsError);
  console.log("VISIT ERROR:", visitorsError);
  console.log("PROJECTS ERROR:", projectsError);

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <Link href="/" className="admin-brand">
          NEWI<span>✳</span> <small>ADMIN</small>
        </Link>

        <div className="admin-top-actions">
          <Link href="/" className="admin-back">
            ← View portfolio
          </Link>
          <AdminLogoutButton />
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">YOUR LITTLE CONTROL ROOM ✦</p>
            <h1>
              Dashboard<span>!</span>
            </h1>
            <p>Manage your projects, one update at a time.</p>
          </div>

          <Link
            href="/admin/projects/new"
            className="admin-add-button"
          >
            + Add project
          </Link>
        </div>

        {projectsError && (
          <p className="admin-error">
            Error projects: {projectsError.message}
          </p>
        )}

        {viewsError && (
          <p className="admin-error">
            Error total views: {viewsError.message}
          </p>
        )}

        {visitorsError && (
          <p className="admin-error">
            Error unique visitors: {visitorsError.message}
          </p>
        )}

        <section className="admin-stats">
          <article className="admin-stat stat-yellow">
            <span>Total views ↗</span>
            <strong>{totalViews ?? 0}</strong>
            <small>Recorded visits</small>
          </article>

          <article className="admin-stat stat-blue">
            <span>Unique visitors ✳</span>
            <strong>{uniqueVisitors}</strong>
            <small>Based on visitor ID</small>
          </article>

          <article className="admin-stat stat-lavender">
            <span>Projects ▦</span>
            <strong>{projects?.length ?? 0}</strong>
            <small>Portfolio projects</small>
          </article>
        </section>

        <section className="admin-projects-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">THE COLLECTION</p>
              <h2>My projects</h2>
            </div>

            <span>{projects?.length ?? 0} projects</span>
          </div>

          {!projects?.length ? (
            <div className="admin-empty">
              <span>✳</span>
              <h3>No projects yet!</h3>
              <p>Tambahkan project pertamamu di sini.</p>

              <Link
                href="/admin/projects/new"
                className="admin-add-button"
              >
                + Add your first project
              </Link>
            </div>
          ) : (
            <div className="admin-project-list">
              {projects.map((project) => (
                <article
                  className="admin-project-row"
                  key={project.id}
                >
                  <div className="admin-project-number">✳</div>

                  <div className="admin-project-info">
                    <h3>{project.title}</h3>
                    <p>
                      {project.year ?? "Year not set"} ·
                      {" "}/projects/{project.slug}
                    </p>

                    {project.featured && (
                      <span className="admin-featured">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <div className="admin-project-actions">
                    <Link
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      className="admin-action"
                    >
                      View ↗
                    </Link>

                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="admin-action"
                    >
                      Edit ✎
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
