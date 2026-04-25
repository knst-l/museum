import { useState, useEffect } from "react"
import Styles from "./ArtifactPage.module.css"
import {ArtifactTimeline} from "./ArtifactTimeline"
import {ArtifactCard} from "../../shared/ui/ArtifactCard/ArtifactCard"
import {useSearchParams} from "react-router-dom"
import Breadcrumbs from "../../shared/ui/Breadcrumbs/Breadcrumbs"
import { ArtifactsAPI, HallsAPI, ArtifactCategoriesAPI, resolveMediaUrl } from "../../shared/const/api"

export function ArtifactPage() {
    const [params] = useSearchParams()
    const hallId = params.get("hallId")
    const categoryId = params.get("categoryId")
    
    const [artifacts, setArtifacts] = useState([])
    const [hall, setHall] = useState(null)
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true

        const loadData = async () => {
            setLoading(true)
            setError(null)

            try {
                const categoriesData = await ArtifactCategoriesAPI.list()
                const categoriesList = categoriesData.results || categoriesData || []

                const artifactParams = {}
                if (hallId) artifactParams.hall = hallId
                if (categoryId) artifactParams.category = categoryId
                
                const artifactsData = await ArtifactsAPI.list(artifactParams)
                const artifactsList = artifactsData.results || artifactsData || []

                let hallData = null
                if (hallId) {
                    try {
                        hallData = await HallsAPI.get(hallId)
                    } catch (err) {
                        console.warn("Не удалось загрузить информацию о зале:", err)
                    }
                }

                if (!isMounted) return

                setArtifacts(artifactsList)
                setHall(hallData)
                setCategories(categoriesList)
            } catch (err) {
                if (!isMounted) return
                console.error("Ошибка при загрузке артефактов:", err)
                setError("Не удалось загрузить артефакты. Попробуйте обновить страницу.")
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadData()

        return () => {
            isMounted = false
        }
    }, [hallId, categoryId])

    const breadcrumbsLinks = [
        ["Главная", "/home"],
        ["Залы", "/halls"]
    ]
    

    if (hall) {
        breadcrumbsLinks.push([hall.name, `/artifacts?hallId=${hall.id}`])
    } else if (!hallId && !loading) {
        breadcrumbsLinks.push(["Артефакты", "/artifacts"])
    }

    const transformedArtifacts = artifacts.map(artifact => {
        const firstImage = artifact.images && artifact.images.length > 0 
            ? artifact.images[0] 
            : null
        const imageUrl = resolveMediaUrl(firstImage?.image_url || firstImage?.image || "/logo192.png")

        return {
            id: artifact.id,
            title: artifact.name || "Без названия",
            year: artifact.creation_year?.toString() || "",
            image: imageUrl,
            imagePosition: firstImage?.object_position || "50% 50%",
            artifact: artifact 
        }
    })

    const artifactsByDecade = {}
    
    transformedArtifacts.forEach(artifact => {
        const year = parseInt(artifact.year)
        if (isNaN(year)) {

            return
        }
        
        const decade = Math.floor(year / 10) * 10
        const decadeKey = String(decade) 
        
        if (!artifactsByDecade[decadeKey]) {
            artifactsByDecade[decadeKey] = []
        }
        artifactsByDecade[decadeKey].push(artifact)
    })

    Object.keys(artifactsByDecade).forEach(decadeKey => {
        if (artifactsByDecade[decadeKey] && Array.isArray(artifactsByDecade[decadeKey])) {
            artifactsByDecade[decadeKey].sort((a, b) => {
                const yearA = parseInt(a.year) || 0
                const yearB = parseInt(b.year) || 0
                return yearA - yearB
            })
        }
    })

    const decades = Object.keys(artifactsByDecade)
        .map(d => {
            if (d === "no-year") return null
            const decadeNum = parseInt(d)
            return isNaN(decadeNum) ? null : decadeNum
        })
        .filter(d => d !== null)
        .sort((a, b) => a - b)

    const timelineDecades = decades.map(decade => ({
        id: decade,
        label: `${decade}е`,
        decade: decade
    }))

    console.log('Artifacts by decade:', artifactsByDecade)
    console.log('Decades:', decades)

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

    if (error) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.ArtifactPage}>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>{error}</p>
                    </div>
                </div>
            </>
        )
    }

    if (transformedArtifacts.length === 0) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.ArtifactPage}>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>Артефакты не найдены</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Breadcrumbs links={breadcrumbsLinks} />
            <div className={Styles.ArtifactPage}>
                <div className={Styles.PageHeader}>
                    <h1 className={Styles.PageTitle}>
                        {hall ? `Экспонаты зала ${hall.name}:` : "Экспонаты:"}
                    </h1>
                </div>
                <div className={Styles.PageContent}>
                    {timelineDecades.length > 0 && (
                        <div className={Styles.TimelineContainer}>
                            <ArtifactTimeline 
                                centuries={timelineDecades} 
                                activeCentury={null}
                                onCenturyClick={(decadeId) => {

                                    const element = document.querySelector(`[data-decade="${decadeId}"]`)
                                    if (element) {
                                        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                                        const offsetPosition = elementPosition - 100 // 100px отступ сверху
                                        
                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                        })
                                    }
                                }}
                            />
                        </div>
                    )}
                    <div className={Styles.ArtifactsContainer}>
                        {decades.map(decade => {

                            const decadeKey = String(decade)
                            const decadeArtifacts = artifactsByDecade[decadeKey] || []
                            
                            if (!decadeArtifacts || !Array.isArray(decadeArtifacts) || decadeArtifacts.length === 0) {
                                return null
                            }
                            
                            return (
                                <div key={decade} className={Styles.DecadeSection} data-decade={decade}>
                                    <h2 className={Styles.DecadeTitle}>{decade}е</h2>
                                    <div className={Styles.ArtifactGrid}>
                                        {decadeArtifacts.map(artifact => (
                                            <ArtifactCard key={artifact.id} artifact={artifact} />
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
