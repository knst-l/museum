import { useState, useEffect } from "react"
import Styles from "./HallPage.module.css"
import {MuseumWidgetList} from "../../shared/ui";
import Breadcrumbs from "../../shared/ui/Breadcrumbs/Breadcrumbs";
import { HallsAPI } from "../../shared/const/api";

export function HallPage() {
    const [halls, setHalls] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const breadcrumbsLinks = [
        ["Главная", "/home"],
        ["Залы", "/halls"]
    ]

    useEffect(() => {
        let isMounted = true

        const loadData = async () => {
            setLoading(true)
            setError(null)

            try {
                const hallsData = await HallsAPI.list()
                const hallsList = hallsData.results || hallsData || []

                if (!isMounted) return

                setHalls(hallsList)
            } catch (err) {
                if (!isMounted) return
                console.error("Ошибка при загрузке залов:", err)
                setError("Не удалось загрузить залы. Попробуйте обновить страницу.")
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
    }, [])

    const transformHallsToWidgets = (hallsList) => {
        return hallsList.map(hall => {
            const imageUrl = hall.image?.image_url || "/logo192.png"
            return {
                id: hall.id,
                text: hall.name,
                imageUrl: imageUrl,
                imagePosition: hall.image?.object_position || "50% 50%",
                link: `/artifacts?hallId=${hall.id}`
            }
        })
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

    if (error) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.ContentSection}>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>{error}</p>
                    </div>
                </div>
            </>
        )
    }

    if (halls.length === 0) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.ContentSection}>
                    <h1 className={Styles.PageTitle}>Выберите зал:</h1>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>Залы не найдены</p>
                    </div>
                </div>
            </>
        )
    }

    const widgets = transformHallsToWidgets(halls)

    return (
        <>
            <Breadcrumbs links={breadcrumbsLinks} />
            <div className={Styles.ContentSection}>
                <h1 className={Styles.PageTitle}>Выберите зал:</h1>
                <MuseumWidgetList widgets={widgets} />
            </div>
        </>
    )
}
