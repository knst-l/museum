import { useState } from 'react';
import Styles from './FeedbackPage.module.css';

export function FeedbackPage() {
    const [formData, setFormData] = useState({
        email: '',
        liked: '',
        disliked: '',
        improvements: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Здесь будет отправка данных на сервер
        console.log('Feedback submitted:', formData);
        setIsSubmitted(true);
        setFormData({
            email: '',
            liked: '',
            disliked: '',
            improvements: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className={Styles.FeedbackPage}>
            <h1>Оставить отзыв</h1>
            <p className={Styles.description}>
                Ваше мнение очень важно для нас! Пожалуйста, поделитесь своими впечатлениями о музее.
            </p>
            
            {isSubmitted ? (
                <div className={Styles.successMessage}>
                    <h2>Спасибо за ваш отзыв!</h2>
                    <p>Мы обязательно рассмотрим ваше сообщение и свяжемся с вами по указанной почте.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className={Styles.form}>
                    <div className={Styles.formGroup}>
                        <label htmlFor="email">Email для ответа</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Введите ваш email"
                        />
                    </div>

                    <div className={Styles.formGroup}>
                        <label htmlFor="liked">Что вам понравилось?</label>
                        <textarea
                            id="liked"
                            name="liked"
                            value={formData.liked}
                            onChange={handleChange}
                            required
                            placeholder="Расскажите, что вам понравилось в музее"
                            rows="4"
                        />
                    </div>

                    <div className={Styles.formGroup}>
                        <label htmlFor="disliked">Что вам не понравилось?</label>
                        <textarea
                            id="disliked"
                            name="disliked"
                            value={formData.disliked}
                            onChange={handleChange}
                            placeholder="Расскажите, что можно улучшить"
                            rows="4"
                        />
                    </div>

                    <div className={Styles.formGroup}>
                        <label htmlFor="improvements">Как бы вы хотели улучшить музей?</label>
                        <textarea
                            id="improvements"
                            name="improvements"
                            value={formData.improvements}
                            onChange={handleChange}
                            placeholder="Ваши предложения по улучшению музея"
                            rows="4"
                        />
                    </div>

                    <button type="submit" className={Styles.submitButton}>
                        Отправить отзыв
                    </button>
                </form>
            )}
        </div>
    );
} 