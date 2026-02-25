import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a COMPANY user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const companyUser = await prisma.user.upsert({
    where: { email: 'company@injoyplan.com' },
    update: {},
    create: {
      email: 'company@injoyplan.com',
      password: hashedPassword,
      userType: 'COMPANY',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Barranco',
          lastName: 'Bar',
          description: 'Bar y restaurante en el corazón de Barranco',
        },
      },
    },
  });

  console.log('✅ Company user created');

  // Create ADMIN user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@injoyplan.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@injoyplan.com',
      password: hashedPassword,
      userType: 'COMPANY',
      role: 'ADMIN',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'Injoyplan',
          description: 'Administrador de la plataforma',
        },
      },
    },
  });

  console.log('✅ Admin user created: admin@injoyplan.com / password123');

  // Locations will be created per event


  // Create events from SheetDB
  // Create events from Google Sheets Via OpenSheet
  console.log('📥 Fetching data from Google Sheets...');

  const SPREADSHEET_ID = '14Lvf6cYL7bys3eELAnFleDBntjF_wGZpYC7558bJ4yM';

  try {
    const fetchSheet = async (sheetName: string) => {
      const res = await fetch(`https://opensheet.elk.sh/${SPREADSHEET_ID}/${sheetName}`);
      if (!res.ok) throw new Error(`Failed to fetch ${sheetName}: ${res.status} ${res.statusText}`);
      return res.json();
    };

    const [eventos, imagenes, fechas, entradas] = await Promise.all([
      fetchSheet('eventos'),
      fetchSheet('imagen'),
      fetchSheet('FechaHorario'),
      fetchSheet('Entradas'),
    ]);

    console.log(`📥 Fetched ${eventos.length} events from Google Sheets`);

    // Clean existing Data
    await prisma.eventDate.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.event.deleteMany({});

    for (const eventData of eventos) {
      // Filter by 'Nuevo' removed to fetch all events
      // if (typeof eventData.Nuevo !== 'undefined' && eventData.Nuevo != '1' && eventData.Nuevo != 1) continue;

      // Find related data
      // Note: OpenSheet returns numbers as strings usually, so standard comparison with loose equality or string conversion
      const eventImages = imagenes.filter((img: any) => img.idRow == eventData.idRow);
      const eventDates = fechas.filter((date: any) => date.idRow == eventData.idRow);
      const eventTickets = entradas.filter((ticket: any) => ticket.idRow == eventData.idRow);

      // Determine price from tickets (take the first one found or default to 0)
      const ticketPrice = eventTickets.length > 0 ? parseFloat(eventTickets[0].Precio) : 0;

      // Determine image (take first or default)
      const mainImage = eventImages.length > 0 ? eventImages[0].url : `https://picsum.photos/400/300?random=${eventData.idRow}`;
      const bannerImage = eventImages.length > 1 ? eventImages[1].url : mainImage;

      // Map category name to what we have in DB
      // Sheet categories might differ, let's normalize or fallback
      let categoryName = 'Entretenimiento'; // Default
      // Simple mapping based on text match
      const catText = eventData.nombreevento + ' ' + eventData.DescripcionEvento;
      if (catText.toLowerCase().includes('teatro')) categoryName = 'Teatro';
      else if (catText.toLowerCase().includes('musica') || catText.toLowerCase().includes('concierto')) categoryName = 'Música';
      else if (catText.toLowerCase().includes('gastronomia') || catText.toLowerCase().includes('comida')) categoryName = 'Gastronomía';
      else if (catText.toLowerCase().includes('cultura') || catText.toLowerCase().includes('arte')) categoryName = 'Cultura';

      // Or use the category ID from sheet if we knew the mapping, but text heuristic is safer for now or random from the allowed list if unknown

      // Create dates array for Prisma
      const datesToCreate = eventDates.map((d: any) => {
        // Parse date dd/mm/yyyy
        const [day, month, year] = d.Fecha.split('/');
        const dateObj = new Date(`${month}/${day}/${year}`);

        // Parse time "19:00-23:00" or just "19:00"
        const times = d.HoraInicio.split('-');
        const startTime = times[0]?.trim() || '00:00';
        const endTime = times[1]?.trim() || '23:59';

        return {
          date: dateObj,
          startTime,
          endTime,
          price: ticketPrice,
          capacity: 100 // Default capacity
        };
      });

      // If no dates, create a dummy one based on created_at or now
      if (datesToCreate.length === 0) {
        datesToCreate.push({
          date: new Date(),
          startTime: '09:00',
          endTime: '18:00',
          price: ticketPrice,
          capacity: 100
        });
      }

      // Parse lat/long from "latitud_longitud" column (e.g. "-12.045, -77.034")
      let latitude: number | null = null;
      let longitude: number | null = null;
      if (eventData.latitud_longitud) {
        const parts = String(eventData.latitud_longitud).split(',');
        if (parts.length === 2) {
          latitude = parseFloat(parts[0].trim());
          longitude = parseFloat(parts[1].trim());
        }
      }

      // Create Location for this event
      const location = await prisma.location.upsert({
        where: {
          id: 'loc_' + eventData.idRow // deterministic ID based on row
        },
        update: {
          name: eventData.NombreLocal || '',
          department: eventData.Departamento || 'Lima',
          province: eventData.Provincia || 'Lima',
          district: eventData.Distrito || 'Lima',
          address: eventData.Dirección || 'Sin dirección',
          latitude: latitude,
          longitude: longitude
        },
        create: {
          id: 'loc_' + eventData.idRow,
          name: eventData.NombreLocal || '',
          department: eventData.Departamento || 'Lima',
          province: eventData.Provincia || 'Lima',
          district: eventData.Distrito || 'Lima',
          address: eventData.Dirección || 'Sin dirección',
          latitude: latitude,
          longitude: longitude
        }
      });

      // Map PlataformaURL correct column name 'PlataformaURLnbbb' or fallback
      const externalUrl = eventData.PlataformaURLnbbb || eventData.PlataformaURL || null;

      // Logic for Featured: 'Si', '1', 'yes', 'true' (case insensitive)
      const destacadoVal = String(eventData.Destacado).trim().toLowerCase();
      const isFeatured = ['si', '1', 'yes', 'true'].includes(destacadoVal);

      await prisma.event.create({
        data: {
          title: eventData.nombreevento,
          description: eventData.DescripcionEvento || 'Sin descripción',
          category: categoryName,
          imageUrl: mainImage,
          bannerUrl: bannerImage,
          websiteUrl: externalUrl, // Map external URL
          isActive: true, // Assuming active
          isFeatured: isFeatured,
          userId: adminUser.id,
          locationId: location.id, // Use the specific location created above
          createdAt: new Date(),
          dates: {
            create: datesToCreate
          }
        }
      });

      // Create Banner if Featured
      if (isFeatured) {
        // Check if banner already exists to avoid dupes? No, we cleared DB.
        await prisma.banner.create({
          data: {
            title: eventData.nombreevento,
            imageUrl: bannerImage || mainImage,
            link: externalUrl || `https://injoyplan.com/evento/${eventData.idRow}`,
            isActive: true,
            order: parseInt(eventData.idRow) || 0
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ Error fetching from SheetDB:', error);
    // Fallback to dummy generation if fetch fails? 
    // For now let's throw so we know it failed
    throw error;
  }

  console.log('✅ Events created from Real Data');

  console.log('✅ Banners created (integrated with events)');

  // Create categories
  const categories = [
    { name: 'Entretenimiento', icon: '/icons/popcorn.png', order: 1 },
    { name: 'Cultura', icon: '/icons/book.png', order: 2 },
    { name: 'Teatro', icon: '/icons/teather.png', order: 3 },
    { name: 'Música', icon: '/icons/music.png', order: 4 },
    { name: 'Gastronomía', icon: '/icons/caja.png', order: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, order: cat.order },
      create: cat,
    });
  }

  console.log('✅ Categories created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
