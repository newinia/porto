
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type ProjectFormProps = {
  projectId?: string;
};

type FormData = {
  title: string;
  slug: string;
  year: string;
  description: string;
  image: string;
  roles: string;
  categories: string;
  tools: string;
  github_url: string;
  figma_url: string;
  live_url: string;
  drive_url: string;
  additional_url: string;
  featured: boolean;
};

type ExistingImage = {
  id: number;
  image_url: string;
  caption: string | null;
  sort_order: number | null;
  is_cover: boolean | null;
};

const initialForm: FormData = {
  title: "",
  slug: "",
  year: new Date().getFullYear().toString(),
  description: "",
  image: "",
  roles: "",
  categories: "",
  tools: "",
  github_url: "",
  figma_url: "",
  live_url: "",
  drive_url: "",
  additional_url: "",
  featured: false,
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export default function ProjectForm({
  projectId,
}: ProjectFormProps) {
  const router = useRouter();
  const isEditing = Boolean(projectId);

  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [error, setError] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  // Memuat detail project saat halaman edit dibuka.
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    async function loadProject() {
      try {
        const { data, error: projectError } = await supabaseBrowser
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (cancelled) return;

        if (projectError || !data) {
          setError(
            projectError?.message ?? "Project tidak ditemukan."
          );
          setLoading(false);
          return;
        }

        const asText = (value: unknown) => {
          if (Array.isArray(value)) return value.join(", ");
          return value == null ? "" : String(value);
        };

        setForm({
          title: data.title ?? "",
          slug: data.slug ?? "",
          year: asText(data.year),
          description: data.description ?? "",
          image: data.image ?? "",
          roles: asText(data.roles),
          categories: asText(data.categories),
          tools: asText(data.tools),
          github_url: data.github_url ?? "",
          figma_url: data.figma_url ?? "",
          live_url: data.live_url ?? "",
          drive_url: data.drive_url ?? "",
          additional_url: data.additional_url ?? "",
          featured: Boolean(data.featured),
        });

        setSlugEdited(true);

        const { data: images, error: imagesError } =
          await supabaseBrowser
            .from("project_images")
            .select("id, image_url, caption, sort_order, is_cover")
            .eq("project_id", projectId)
            .order("sort_order", { ascending: true });

        if (cancelled) return;

        if (imagesError) {
          setError(
            "Project berhasil dimuat, tetapi galeri gagal dimuat: " +
              imagesError.message
          );
        } else {
          setExistingImages((images ?? []) as ExistingImage[]);
        }

        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Gagal memuat project. Coba refresh halaman.");
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  function updateField(
    field: keyof FormData,
    value: string | boolean
  ) {
    setForm((previous) => {
      const next = { ...previous, [field]: value };

      if (field === "title" && !slugEdited) {
        next.slug = toSlug(String(value));
      }

      return next;
    });
  }

  function selectCover(file: File | null) {
    setCoverFile(file);
  }

  function selectGallery(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setGalleryFiles((previous) => [...previous, ...selected]);
  }

  function removeSelectedGallery(index: number) {
    setGalleryFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  async function uploadImage(
    file: File,
    path: string
  ): Promise<string> {
    const { error: uploadError } = await supabaseBrowser.storage
      .from("project-images")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Gagal upload ${file.name}: ${uploadError.message}`);
    }

    const { data } = supabaseBrowser.storage
      .from("project-images")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.slug.trim()) {
      setError("Judul dan slug wajib diisi.");
      return;
    }

    if (
      form.year.trim() &&
      !Number.isInteger(Number(form.year))
    ) {
      setError("Tahun harus berupa angka bulat.");
      return;
    }

    if (coverFile && !coverFile.type.startsWith("image/")) {
      setError("File cover harus berupa gambar.");
      return;
    }

    if (
      galleryFiles.some((file) => !file.type.startsWith("image/"))
    ) {
      setError("Semua file galeri harus berupa gambar.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabaseBrowser.auth.getUser();

      if (authError || !user) {
        router.replace("/admin/login");
        return;
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        year: form.year.trim() ? Number(form.year) : null,
        description: form.description.trim() || null,
        // Pertahankan cover lama jika tidak memilih cover baru.
        image: form.image.trim() || null,
        roles: toArray(form.roles),
        categories: toArray(form.categories),
        tools: toArray(form.tools),
        github_url: form.github_url.trim() || null,
        figma_url: form.figma_url.trim() || null,
        live_url: form.live_url.trim() || null,
        drive_url: form.drive_url.trim() || null,
        additional_url: form.additional_url.trim() || null,
        featured: form.featured,
      };

      const result = isEditing
        ? await supabaseBrowser
            .from("projects")
            .update(payload)
            .eq("id", projectId!)
            .select("id")
            .single()
        : await supabaseBrowser
            .from("projects")
            .insert(payload)
            .select("id")
            .single();

      if (result.error || !result.data) {
        setError(
          result.error?.message ?? "Project gagal disimpan."
        );
        return;
      }

      const savedProjectId = result.data.id;

      // Upload cover baru jika dipilih.
      if (coverFile) {
        const path =
          `${savedProjectId}/cover-${Date.now()}-${safeFileName(coverFile.name)}`;

        const coverUrl = await uploadImage(coverFile, path);

        const { error: coverUpdateError } = await supabaseBrowser
          .from("projects")
          .update({ image: coverUrl })
          .eq("id", savedProjectId);

        if (coverUpdateError) {
          throw new Error(
            "Cover terupload, tetapi URL cover gagal disimpan: " +
              coverUpdateError.message
          );
        }

        // Foto cover lama tetap di galeri, tetapi status cover-nya direset.
        const { error: resetError } = await supabaseBrowser
          .from("project_images")
          .update({ is_cover: false })
          .eq("project_id", savedProjectId);

        if (resetError) {
          throw new Error(
            "URL cover tersimpan, tetapi status galeri gagal diperbarui: " +
              resetError.message
          );
        }

        const { error: insertCoverError } = await supabaseBrowser
          .from("project_images")
          .insert({
            project_id: savedProjectId,
            image_url: coverUrl,
            caption: "Cover",
            sort_order: 0,
            is_cover: true,
          });

        if (insertCoverError) {
          throw new Error(
            "Cover tersimpan, tetapi data galeri gagal disimpan: " +
              insertCoverError.message
          );
        }
      }

      // Upload foto galeri yang baru dipilih.
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        const path =
          `${savedProjectId}/gallery-${Date.now()}-${i}-${safeFileName(file.name)}`;

        const imageUrl = await uploadImage(file, path);

        const { error: insertImageError } = await supabaseBrowser
          .from("project_images")
          .insert({
            project_id: savedProjectId,
            image_url: imageUrl,
            caption: file.name,
            sort_order: existingImages.length + i + 1,
            is_cover: false,
          });

        if (insertImageError) {
          throw new Error(
            `Foto ${file.name} terupload, tetapi data galeri gagal disimpan: ` +
              insertImageError.message
          );
        }
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Coba lagi."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="admin-form-loading">Memuat project...</p>;
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <Link href="/admin" className="admin-brand">
          NEWI<span>✳</span> <small>ADMIN</small>
        </Link>

        <Link href="/admin" className="admin-back">
          ← Kembali ke dashboard
        </Link>
      </header>

      <div className="admin-content">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">THE PROJECT COLLECTION ✦</p>
            <h1>
              {isEditing ? "Edit project" : "New project"}
              <span>!</span>
            </h1>
            <p>
              {isEditing
                ? "Perbarui detail project kamu."
                : "Tambahkan karya baru ke portfolio kamu."}
            </p>
          </div>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <section className="admin-form-section">
            <h2>Basic information</h2>

            <label>
              Project title *
              <input
                required
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                placeholder="Contoh: KUDAKU Management System"
              />
            </label>

            <label>
              Slug URL *
              <input
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  updateField("slug", toSlug(e.target.value));
                }}
                placeholder="kudaku-management-system"
              />
              <small>
                Dipakai di alamat /projects/slug-kamu
              </small>
            </label>

            <label>
              Year
              <input
                type="number"
                step="1"
                value={form.year}
                onChange={(e) =>
                  updateField("year", e.target.value)
                }
                placeholder="2026"
              />
            </label>

            <label>
              Description
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                placeholder="Ceritakan project ini, tujuan, dan kontribusimu..."
              />
            </label>
          </section>

          <section className="admin-form-section">
            <h2>Role & tools</h2>

            <label>
              Roles
              <input
                value={form.roles}
                onChange={(e) =>
                  updateField("roles", e.target.value)
                }
                placeholder="Frontend Developer, UI/UX Designer"
              />
              <small>Pisahkan beberapa role dengan koma.</small>
            </label>

            <label>
              Categories
              <input
                value={form.categories}
                onChange={(e) =>
                  updateField("categories", e.target.value)
                }
                placeholder="Frontend, UI/UX"
              />
              <small>Pisahkan beberapa kategori dengan koma.</small>
            </label>

            <label>
              Tools
              <input
                value={form.tools}
                onChange={(e) =>
                  updateField("tools", e.target.value)
                }
                placeholder="Laravel, Vue.js, Figma, MySQL"
              />
              <small>Pisahkan tools dengan koma.</small>
            </label>
          </section>

          <section className="admin-form-section">
            <h2>Cover image ✳</h2>

            {form.image && !coverFile && (
              <div className="admin-image-preview">
                <img src={form.image} alt="Cover project saat ini" />
                <span>Cover saat ini</span>
              </div>
            )}

            {coverFile && (
              <div className="admin-selected-file">
                <span>✓</span>
                <div>
                  <strong>{coverFile.name}</strong>
                  <small>
                    {(coverFile.size / (1024 * 1024)).toFixed(2)} MB
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => setCoverFile(null)}
                >
                  Hapus pilihan
                </button>
              </div>
            )}

            <label className="admin-upload-area">
              <span className="admin-upload-icon">↑</span>
              <strong>Pilih cover dari laptop</strong>
              <span>Format gambar seperti JPG, PNG, atau WebP</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  selectCover(e.target.files?.[0] ?? null)
                }
              />
            </label>
            <small>
              Jika kamu tidak memilih cover baru saat edit,
              cover lama akan tetap digunakan.
            </small>
          </section>

          <section className="admin-form-section">
            <h2>Project gallery ✷</h2>
            <p>Foto tambahan untuk halaman detail project.</p>

            {existingImages.length > 0 && (
              <>
                <h3>Foto yang sudah tersimpan</h3>
                <div className="admin-gallery-preview">
                  {existingImages.map((image) => (
                    <div key={image.id}>
                      <img
                        src={image.image_url}
                        alt={image.caption ?? "Foto project"}
                      />
                      <span>
                        {image.is_cover
                          ? "Cover"
                          : image.caption ?? "Foto project"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <label className="admin-upload-area">
              <span className="admin-upload-icon">＋</span>
              <strong>Pilih foto galeri</strong>
              <span>Pilih beberapa gambar sekaligus</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  selectGallery(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
            </label>

            {galleryFiles.length > 0 && (
              <div className="admin-selected-gallery">
                <h3>Foto baru ({galleryFiles.length})</h3>

                {galleryFiles.map((file, index) => (
                  <div
                    className="admin-selected-file"
                    key={`${file.name}-${file.size}-${index}`}
                  >
                    <span>▧</span>
                    <div>
                      <strong>{file.name}</strong>
                      <small>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedGallery(index)}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-form-section">
            <h2>Project links</h2>

            <label>
              GitHub URL
              <input
                type="url"
                value={form.github_url}
                onChange={(e) =>
                  updateField("github_url", e.target.value)
                }
                placeholder="https://github.com/..."
              />
            </label>

            <label>
              Figma URL
              <input
                type="url"
                value={form.figma_url}
                onChange={(e) =>
                  updateField("figma_url", e.target.value)
                }
                placeholder="https://figma.com/..."
              />
            </label>

            <label>
              Live demo URL
              <input
                type="url"
                value={form.live_url}
                onChange={(e) =>
                  updateField("live_url", e.target.value)
                }
                placeholder="https://..."
              />
            </label>

            <label>
              Drive URL
              <input
                type="url"
                value={form.drive_url}
                onChange={(e) =>
                  updateField("drive_url", e.target.value)
                }
                placeholder="https://drive.google.com/..."
              />
            </label>

            <label>
              Additional link
              <input
                type="url"
                value={form.additional_url}
                onChange={(e) =>
                  updateField("additional_url", e.target.value)
                }
                placeholder="https://..."
              />
            </label>
          </section>

          <label className="admin-featured-check">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                updateField("featured", e.target.checked)
              }
            />
            Tampilkan sebagai featured project
          </label>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-form-actions">
            <Link href="/admin" className="admin-cancel">
              Cancel
            </Link>

            <button
              className="admin-add-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Menyimpan & upload foto..."
                : isEditing
                  ? "Save changes ↗"
                  : "Create project ↗"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
