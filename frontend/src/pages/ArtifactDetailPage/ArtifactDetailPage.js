import { useState, useEffect } from "react"
import Styles from "./ArtifactDetailPage.module.css"
import { useParams, useNavigate } from "react-router-dom"
import Breadcrumbs from "../../shared/ui/Breadcrumbs/Breadcrumbs"
import { ArtifactsAPI, HallsAPI } from "../../shared/const/api"

export function ArtifactDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    
    const [artifact, setArtifact] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true


        setArtifact(null)
        setLoading(true)
        setError(null)

        const loadArtifact = async () => {
            if (!id) {
                if (isMounted) {
                    setLoading(false)
                    setError("ID артефакта не указан")
                }
                return
            }

            setLoading(true)
            setError(null)

            try {
                const artifactData = await ArtifactsAPI.get(id)

                if (!isMounted) return

                const imagesArray = Array.isArray(artifactData.images) ? artifactData.images : []
                const firstImage = imagesArray[0]
                const imageUrl = firstImage?.image_url || firstImage?.url || "/logo192.png"

                const transformedArtifact = {
                    id: artifactData.id,
                    title: artifactData.name || "Без названия",
                    year: artifactData.creation_year?.toString() || "",
                    description: artifactData.description || "",
                    image: imageUrl,
                    images: imagesArray.length > 0 
                        ? imagesArray.map(img => img?.image_url || img?.url || "/logo192.png")
                        : ["/logo192.png"],
                    category: artifactData.category,
                    hall: artifactData.hall,
                    historical_figures: artifactData.historical_figures || []
                }

                setArtifact(transformedArtifact)
            } catch (err) {
                if (!isMounted) return
                console.error("Ошибка при загрузке артефакта:", err)
                setError("Не удалось загрузить артефакт. Возможно, он не существует.")
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        if (id) {
            loadArtifact()
        }

        return () => {
            isMounted = false
        }
    }, [id]) 

    const breadcrumbsLinks = [
        ["Главная", "/home"],
        ["Залы", "/halls"]
    ]
    
    if (artifact) {
        if (artifact.hall) {
            breadcrumbsLinks.push([artifact.hall.name || "Зал", `/artifacts?hallId=${artifact.hall.id}`])
        } else {
            breadcrumbsLinks.push(["Артефакты", "/artifacts"])
        }
        breadcrumbsLinks.push([artifact.title, `/artifact/${artifact.id}`])
    }

    if (loading) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.LoadingOverlay}>
                    <div className={Styles.Spinner}></div>
                </div>
            </>
        )
    }

    if (error || !artifact) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.ArtifactDetailPage}>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>{error || "Артефакт не найден"}</p>
                        <button 
                            onClick={() => navigate("/artifacts")}
                            style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
                        >
                            Вернуться к списку артефактов
                        </button>
                    </div>
                </div>
            </>
        )
    }

    const galleryImages = artifact.images.length > 0 ? artifact.images : ["/logo192.png"]

    return (
        <>
            <Breadcrumbs links={breadcrumbsLinks} />
            <div className={Styles.ArtifactDetailPage}>
                <h1 className={Styles.PageTitle}>{artifact.title}</h1>
                <div className={Styles.Content}>
                    <div className={Styles.ImageGallery}>
                        <div className={Styles.MainImage}>
                            <img src={artifact.image} alt={artifact.title} className={Styles.Image} />
                        </div>
                        {galleryImages.length > 1 && (
                            <div className={Styles.Thumbnails}>
                                {galleryImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={Styles.Thumbnail}
                                        onClick={() => {
                                            const mainImage = document.querySelector(`.${Styles.MainImage} img`)
                                            if (mainImage) {
                                                mainImage.src = image
                                            }
                                        }}
                                    >
                                        <img src={image} alt={`${artifact.title} - фото ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={Styles.Info}>
                        <div className={Styles.Metadata}>
                            <div className={Styles.MetadataRow}>
                                <span className={Styles.MetadataLabel}>Название:</span>
                                <span className={Styles.MetadataValue}>{artifact.title}</span>
                            </div>
                            <div className={Styles.MetadataRow}>
                                <span className={Styles.MetadataLabel}>Год изобретения:</span>
                                <span className={Styles.MetadataValue}>{artifact.year || "Не указан"}</span>
                            </div>
                            {artifact.historical_figures && artifact.historical_figures.length > 0 && (
                                <div className={Styles.MetadataRow}>
                                    <span className={Styles.MetadataLabel}>Учёные:</span>
                                    <span className={Styles.MetadataValue}>
                                        {artifact.historical_figures.map(fig => fig.full_name || `${fig.last_name} ${fig.first_name}`).join(", ")}
                                    </span>
                                </div>
                            )}
                        </div>
                        {artifact.description && (
                            <div className={Styles.Description}>
                                <h2>Описание</h2>
                                <p>{artifact.description}</p>
                            </div>
                        )}
                        {artifact.hall && (
                            <div className={Styles.Location}>
                                <h2>Расположение</h2>
                                <p>Зал: {artifact.hall.name}</p>
                                {artifact.category && (
                                    <p>Категория: {artifact.category.name}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
