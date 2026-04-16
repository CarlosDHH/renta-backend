import prisma from '../config/prisma.js'
import { generateResponse } from '../utils/handleResponse.js'
import { sendContactReply } from './email.service.js'

// ─── Content público ──────────────────────────────────────────────────────────

export const getContent = async () => {
  try {
    const [config, hero, services, products, news] = await Promise.all([
      prisma.landingConfig.findFirst(),
      prisma.landingHero.findFirst(),
      prisma.landingService.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.landingProduct.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.landingNews.findMany({
        where: { active: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const data = {
      ...(config && {
        companyName: config.companyName,
        tagline: config.tagline,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
      }),
      hero,
      services,
      products,
      news,
    }

    return generateResponse(200, true, 'OK', data)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener contenido', null, error.message)
  }
}

// ─── Config (fila única) ──────────────────────────────────────────────────────

export const getConfig = async () => {
  try {
    const config = await prisma.landingConfig.findFirst()
    if (!config) return generateResponse(404, false, 'Configuración no encontrada')
    return generateResponse(200, true, 'Configuración obtenida', config)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener configuración', null, error.message)
  }
}

export const updateConfig = async (data) => {
  try {
    const config = await prisma.landingConfig.findFirst()
    if (!config) return generateResponse(404, false, 'Configuración no encontrada')

    const updated = await prisma.landingConfig.update({
      where: { id: config.id },
      data: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.tagline !== undefined && { tagline: data.tagline }),
        ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
        ...(data.accentColor !== undefined && { accentColor: data.accentColor }),
      },
    })

    return generateResponse(200, true, 'Configuración actualizada', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar configuración', null, error.message)
  }
}

// ─── Hero (fila única) ────────────────────────────────────────────────────────

export const getHero = async () => {
  try {
    const hero = await prisma.landingHero.findFirst()
    if (!hero) return generateResponse(404, false, 'Hero no encontrado')
    return generateResponse(200, true, 'Hero obtenido', hero)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener hero', null, error.message)
  }
}

export const updateHero = async (data) => {
  try {
    const hero = await prisma.landingHero.findFirst()
    if (!hero) return generateResponse(404, false, 'Hero no encontrado')

    const updated = await prisma.landingHero.update({
      where: { id: hero.id },
      data: {
        ...(data.badge !== undefined && { badge: data.badge }),
        ...(data.headline !== undefined && { headline: data.headline }),
        ...(data.headlineAccent !== undefined && { headlineAccent: data.headlineAccent }),
        ...(data.subheadline !== undefined && { subheadline: data.subheadline }),
        ...(data.ctaPrimary !== undefined && { ctaPrimary: data.ctaPrimary }),
        ...(data.ctaSecondary !== undefined && { ctaSecondary: data.ctaSecondary }),
        ...(data.statValue !== undefined && { statValue: data.statValue }),
        ...(data.statLabel !== undefined && { statLabel: data.statLabel }),
      },
    })

    return generateResponse(200, true, 'Hero actualizado', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar hero', null, error.message)
  }
}

// ─── Services ─────────────────────────────────────────────────────────────────

export const getServices = async () => {
  try {
    const services = await prisma.landingService.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return generateResponse(200, true, 'Servicios obtenidos', services)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener servicios', null, error.message)
  }
}

export const createService = async (data) => {
  try {
    const service = await prisma.landingService.create({
      data: {
        icon: data.icon,
        title: data.title,
        description: data.description,
        features: data.features ?? [],
        highlighted: data.highlighted ?? false,
        sortOrder: data.sortOrder ?? 0,
        active: data.active ?? true,
      },
    })
    return generateResponse(201, true, 'Servicio creado', service)
  } catch (error) {
    return generateResponse(500, false, 'Error al crear servicio', null, error.message)
  }
}

export const updateService = async (id, data) => {
  try {
    const service = await prisma.landingService.findUnique({ where: { id } })
    if (!service) return generateResponse(404, false, 'Servicio no encontrado')

    const updated = await prisma.landingService.update({
      where: { id },
      data: {
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.features !== undefined && { features: data.features }),
        ...(data.highlighted !== undefined && { highlighted: data.highlighted }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.active !== undefined && { active: data.active }),
      },
    })

    return generateResponse(200, true, 'Servicio actualizado', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar servicio', null, error.message)
  }
}

export const removeService = async (id) => {
  try {
    const service = await prisma.landingService.findUnique({ where: { id } })
    if (!service) return generateResponse(404, false, 'Servicio no encontrado')

    await prisma.landingService.delete({ where: { id } })

    return generateResponse(200, true, 'Servicio eliminado')
  } catch (error) {
    return generateResponse(500, false, 'Error al eliminar servicio', null, error.message)
  }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async () => {
  try {
    const products = await prisma.landingProduct.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return generateResponse(200, true, 'Productos obtenidos', products)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener productos', null, error.message)
  }
}

export const createProduct = async (data) => {
  try {
    const product = await prisma.landingProduct.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageAlt: data.imageAlt,
        badge: data.badge ?? null,
        sortOrder: data.sortOrder ?? 0,
        active: data.active ?? true,
      },
    })
    return generateResponse(201, true, 'Producto creado', product)
  } catch (error) {
    return generateResponse(500, false, 'Error al crear producto', null, error.message)
  }
}

export const updateProduct = async (id, data) => {
  try {
    const product = await prisma.landingProduct.findUnique({ where: { id } })
    if (!product) return generateResponse(404, false, 'Producto no encontrado')

    const updated = await prisma.landingProduct.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.imageAlt !== undefined && { imageAlt: data.imageAlt }),
        ...(data.badge !== undefined && { badge: data.badge }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.active !== undefined && { active: data.active }),
      },
    })

    return generateResponse(200, true, 'Producto actualizado', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar producto', null, error.message)
  }
}

export const removeProduct = async (id) => {
  try {
    const product = await prisma.landingProduct.findUnique({ where: { id } })
    if (!product) return generateResponse(404, false, 'Producto no encontrado')

    await prisma.landingProduct.delete({ where: { id } })

    return generateResponse(200, true, 'Producto eliminado')
  } catch (error) {
    return generateResponse(500, false, 'Error al eliminar producto', null, error.message)
  }
}

// ─── News ─────────────────────────────────────────────────────────────────────

export const getNews = async () => {
  try {
    const news = await prisma.landingNews.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    return generateResponse(200, true, 'Noticias obtenidas', news)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener noticias', null, error.message)
  }
}

export const createNews = async (data) => {
  try {
    const news = await prisma.landingNews.create({
      data: {
        category: data.category,
        date: data.date,
        title: data.title,
        excerpt: data.excerpt,
        active: data.active ?? true,
      },
    })
    return generateResponse(201, true, 'Noticia creada', news)
  } catch (error) {
    return generateResponse(500, false, 'Error al crear noticia', null, error.message)
  }
}

export const updateNews = async (id, data) => {
  try {
    const news = await prisma.landingNews.findUnique({ where: { id } })
    if (!news) return generateResponse(404, false, 'Noticia no encontrada')

    const updated = await prisma.landingNews.update({
      where: { id },
      data: {
        ...(data.category !== undefined && { category: data.category }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.active !== undefined && { active: data.active }),
      },
    })

    return generateResponse(200, true, 'Noticia actualizada', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar noticia', null, error.message)
  }
}

export const removeNews = async (id) => {
  try {
    const news = await prisma.landingNews.findUnique({ where: { id } })
    if (!news) return generateResponse(404, false, 'Noticia no encontrada')

    await prisma.landingNews.delete({ where: { id } })

    return generateResponse(200, true, 'Noticia eliminada')
  } catch (error) {
    return generateResponse(500, false, 'Error al eliminar noticia', null, error.message)
  }
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const getContacts = async () => {
  try {
    const contacts = await prisma.landingContact.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return generateResponse(200, true, 'Contactos obtenidos', contacts)
  } catch (error) {
    return generateResponse(500, false, 'Error al obtener contactos', null, error.message)
  }
}

export const updateContactStatus = async (id, status) => {
  try {
    const contact = await prisma.landingContact.findUnique({ where: { id } })
    if (!contact) return generateResponse(404, false, 'Contacto no encontrado')

    const updated = await prisma.landingContact.update({
      where: { id },
      data: { status },
    })

    return generateResponse(200, true, 'Estado actualizado', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al actualizar contacto', null, error.message)
  }
}

export const replyContact = async (id, { subject, body }) => {
  try {
    const contact = await prisma.landingContact.findUnique({ where: { id } })
    if (!contact) return generateResponse(404, false, 'Contacto no encontrado')

    const emailResult = await sendContactReply(contact.email, contact.name, subject, body)
    if (!emailResult.success) return emailResult

    const updated = await prisma.landingContact.update({
      where: { id },
      data: { status: 'REPLIED' },
    })

    return generateResponse(200, true, 'Respuesta enviada', updated)
  } catch (error) {
    return generateResponse(500, false, 'Error al responder contacto', null, error.message)
  }
}

export const submitContact = async (data) => {
  try {
    const contact = await prisma.landingContact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        serviceType: data.serviceType,
        message: data.message,
      },
    })
    return generateResponse(201, true, 'Mensaje enviado', contact)
  } catch (error) {
    return generateResponse(500, false, 'Error al enviar mensaje', null, error.message)
  }
}
