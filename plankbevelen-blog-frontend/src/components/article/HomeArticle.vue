<template>
    <div class="home-article">
        <div class="card article-card" v-if="coverLeft">
            <div class="text-section">
                <div class="article-header">
                    <div class="category-tag">{{ categoryName }}</div>
                </div>
                <h2 class="article-title">{{ article.title }}</h2>
                <p class="article-summary">{{ article.summary || '暂无摘要...' }}</p>
                <div class="article-stats">
                    <div class="stat-item">
                        <svg-icon name="view" size="14px" color="var(--text-color)"/>
                        <span>{{ formatNumber(article.views_count) }}</span>
                    </div>
                    <div class="stat-item">
                        <svg-icon name="comment" size="14px" color="var(--text-color)"/>
                        <span>{{ formatNumber(article.comments_count) }}</span>
                    </div>
                    <div class="stat-item">
                        <svg-icon name="score" size="14px" color="var(--text-color)"/>
                        <span>{{ article.average_score ? article.average_score : '0.0' }}</span>
                    </div>
                    <div class="stat-item">
                        <svg-icon name="time" size="14px" color="var(--text-color)"/>
                        <span>{{ formatDate(article.created_at) }}</span>
                    </div>
                </div>
                <div v-if="article.tags && article.tags.length > 0" class="article-tags">
                    <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
            </div>
            <div class="cover-section">
                <img v-lazy="article.cover || '/loading.gif'" :alt="article.title" class="cover-image" />
            </div>
        </div>
        <div class="card article-card" v-else>
            <div class="cover-section">
                <img v-lazy="article.cover || '/loading.gif'" :alt="article.title" class="cover-image" />
            </div>
            <div class="text-section">
                <div class="article-header">
                    <div class="category-tag">{{ categoryName }}</div>
                </div>
                <h2 class="article-title">{{ article.title }}</h2>
                <p class="article-summary">{{ article.summary || '暂无摘要...' }}</p>
                <div class="article-stats">
                    <div class="stat-item">
                        <svg-icon name="view" size="14px" color="var(--text-color)"/>
                        <span>{{ formatNumber(article.views_count) }}</span>
                    </div>
                    <div class="stat-item">
                        <svg-icon name="comment" size="14px" color="var(--text-color)"/>
                        <span>{{ formatNumber(article.comments_count) }}</span>
                    </div>
                    <div class="stat-item">
                        <svg-icon name="score" size="14px" color="var(--text-color)"/>
                        <span>{{ article.average_score ? article.average_score : '0.0' }}</span>
                    </div>
                    <div class="stat-item">
                        <svg-icon name="time" size="14px" color="var(--text-color)"/>
                        <span>{{ formatDate(article.created_at) }}</span>
                    </div>
                </div>
                <div v-if="article.tags && article.tags.length > 0" class="article-tags">
                    <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ArticleEntity } from '@/types/article'
import { useArticleStore } from '@/stores/article'
import { formatNumber, formatDate } from '@/utils/format'

const props = defineProps({
    article: {
        type: Object as () => ArticleEntity,
        required: true
    },
    coverLeft: {
        type: Boolean,
        default: true
    },
})

const router = useRouter()
const articleStore = useArticleStore()

// 获取分类名称
const categoryName = computed(() => {
    return articleStore.getCategoryNameById(props.article.category_id) || '未分类'
})

</script>

<style lang="less" scoped>
.home-article {
    margin-bottom: 24px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .article-card {
        display: flex;
        height: 260px;
        overflow: hidden;
        border-radius: 12px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        transition: var(--theme-transition);

        .text-section {
            flex: 1;
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .article-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;

                .category-tag {
                    background: linear-gradient(135deg, var(--primary-color), #667eea);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .top-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: #ff6b6b;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 500;
                }
            }

            .article-title {
                font-size: 20px;
                font-weight: 600;
                color: var(--text-color);
                margin: 0 0 12px 0;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                transition: color 0.3s ease;

                &:hover {
                    color: var(--primary-color);
                }
            }

            .article-summary {
                color: var(--text-color-secondary);
                font-size: 14px;
                line-height: 1.6;
                margin: 0 0 16px 0;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                flex: 1;
            }

            .article-stats {
                display: flex;
                gap: 16px;
                margin-bottom: 12px;

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: var(--text-color-light);
                    font-size: 12px;

                    span {
                        font-weight: 500;
                    }
                }
            }

            .article-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;

                .tag {
                    background: var(--tag-bg);
                    color: var(--text-color-secondary);
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 500;
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;

                    &:hover {
                        background: var(--primary-color);
                        color: white;
                        border-color: var(--primary-color);
                    }
                }
            }
        }

        .cover-section {
            flex: 0 0 300px;
            position: relative;
            overflow: hidden;

            .cover-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }

            &:hover .cover-image {
                transform: scale(1.05);
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .home-article {
        .article-card {
            flex-direction: column;
            min-height: auto;

            .cover-section {
                flex: none;
                height: 200px;
            }

            .text-section {
                padding: 16px;

                .article-title {
                    font-size: 18px;
                }

                .article-stats {
                    gap: 12px;
                }
            }
        }
    }
}
</style>