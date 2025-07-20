import React, { useEffect, useState, useRef } from 'react';
import { fetchBannersData } from '@/api/notion/notionService';
import { simplifyNotionBanners } from '@/api/notion/notionTransformer';
import BannerComponent, { BannerItem } from '@/components/Banner/BannerComponent';

interface BannerProps {
  onLoad?: () => void; // Adicionando a prop onLoad
}

const Banner: React.FC<BannerProps> = ({ onLoad }) => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Função para buscar e filtrar banners
  const fetchAndSetBanners = async () => {
    try {
      const response = await fetchBannersData();
      const simplifiedBanners = simplifyNotionBanners(response);
      const now = new Date().toISOString().split('T')[0];
      const filteredAndSorted = simplifiedBanners
        .filter(banner => {
          if (!banner.periodStart || !banner.periodEnd) return false;
          const start = new Date(banner.periodStart).toISOString().split('T')[0];
          const end = new Date(banner.periodEnd).toISOString().split('T')[0];
          return now >= start && now <= end;
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdTime).getTime();
          const dateB = new Date(b.createdTime).getTime();
          return dateA - dateB;
        });
      const bannersData = filteredAndSorted.map(banner => ({
        id: banner.id,
        image: banner.imageUrl || '',
        createdTime: banner.createdTime,
        lastEditedTime: banner.lastEditedTime,
        createdBy: banner.createdBy,
        lastEditedBy: banner.lastEditedBy,
        title: banner.title,
        description: banner.description,
        link: banner.link || '',
      }));
      // Só atualiza se mudou (comparando id e image)
      const isDifferent =
        banners.length !== bannersData.length ||
        banners.some((b, i) => b.id !== bannersData[i]?.id || b.image !== bannersData[i]?.image);
      if (isDifferent) {
        setBanners(bannersData);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  useEffect(() => {
    fetchAndSetBanners();
    // Polling a cada 2 minutos
    pollingRef.current = setInterval(fetchAndSetBanners, 120000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return <BannerComponent banners={banners} onLoad={onLoad} />;
};

export default Banner;