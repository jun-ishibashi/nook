/**
 * 開発用シード。既存の User をすべて削除（関連データは FK の Cascade で消えます）。
 * 本番 DB では実行しないでください。
 *
 * 画像・プロフィール写真は next.config の remotePatterns に含まれる Unsplash の URL を使用。
 * （Unsplash 側で写真が削除されると 404 になるため、表示できないときは URL を差し替えてください。）
 * ログインは Google OAuth のため、シードのメールでそのままログインできるとは限りません。
 * 未ログインでもホーム・部屋詳細・プロフィールの表示確認に使えます。
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const IMG = {
  desk: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80",
  living: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
  bedroom: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
  kitchen: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  oneroom: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  plants: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
  dining: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
  hallway: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  bookshelf:
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
} as const;

/** プロフィールアイコン（next.config の Unsplash のみ） */
const AVATAR = {
  alice:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
  kota: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80",
  mina: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
  ren: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
} as const;

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (!url || (!url.startsWith("postgres://") && !url.startsWith("postgresql://"))) {
    throw new Error("DATABASE_URL が未設定か、postgresql URL ではありません。.env を確認してください。");
  }
  neonConfig.webSocketConstructor = ws;
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: url }),
  });
}

const prisma = createPrisma();

async function main() {
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: {
      id: "seed_user_alice",
      name: "アリス",
      email: "seed-alice@nook.example",
      image: AVATAR.alice,
      bio: "1K・グレー階調。デスク周りを整え中です。",
      profileLink: "",
    },
  });

  const kota = await prisma.user.create({
    data: {
      id: "seed_user_kota",
      name: "コウタ",
      email: "seed-kota@nook.example",
      image: AVATAR.kota,
      bio: "賃貸ワンルーム。植物とコーヒーが好きです。",
      profileLink: "",
    },
  });

  const mina = await prisma.user.create({
    data: {
      id: "seed_user_mina",
      name: "ミナ",
      email: "seed-mina@nook.example",
      image: AVATAR.mina,
      bio: "ミニマル寄りで物量を抑えています。",
      profileLink: "",
    },
  });

  const ren = await prisma.user.create({
    data: {
      id: "seed_user_ren",
      name: "レン",
      email: "seed-ren@nook.example",
      image: AVATAR.ren,
      bio: "2LDK・ダイニング中心に過ごしています。",
      profileLink: "",
    },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: alice.id, followingId: kota.id },
      { followerId: kota.id, followingId: mina.id },
      { followerId: mina.id, followingId: alice.id },
      { followerId: ren.id, followingId: alice.id },
      { followerId: ren.id, followingId: kota.id },
      { followerId: ren.id, followingId: mina.id },
      { followerId: alice.id, followingId: ren.id },
      { followerId: kota.id, followingId: ren.id },
      { followerId: mina.id, followingId: ren.id },
    ],
  });

  const postAlice1 = await prisma.post.create({
    data: {
      title: "南向きカウンターとデスク",
      description: "光が入る時間帯だけカーテンを開けています。仕事用はこの一角にまとめました。",
      category: "study",
      housingType: "rental",
      layoutType: "1k_1dk",
      roomContextNote: "築12年・2階",
      userId: alice.id,
      medias: {
        create: [
          { path: IMG.desk, mood: "ambient_light" },
          { path: IMG.oneroom, mood: "concrete" },
        ],
      },
      styleTags: {
        create: [{ tagSlug: "gray_tone" }, { tagSlug: "rental" }, { tagSlug: "desk" }, { tagSlug: "kodawari" }],
      },
      furnitureItems: {
        create: [
          {
            name: "デスクライト",
            brand: "無印良品",
            brandSlug: "",
            productUrl: "https://www.muji.com/jp/ja/store",
            productHost: "muji.com",
            note: "",
            sortOrder: 0,
            mediaIndex: 0,
            pinX: 0.38,
            pinY: 0.32,
            price: 3990,
            linkRelation: "purchased",
            linkVerifiedAt: new Date("2024-06-15T00:00:00.000Z"),
          },
          {
            name: "脚付きデスク（参考）",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.ikea.com/jp/ja/",
            productHost: "ikea.com",
            note: "サイズ感の参考",
            sortOrder: 1,
            mediaIndex: 0,
            pinX: 0.62,
            pinY: 0.58,
            price: 24990,
            linkRelation: "reference",
            linkVerifiedAt: null,
          },
          {
            name: "ローテーブル",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.nitori-net.jp/ec/",
            productHost: "nitori-net.jp",
            note: "2枚目のワンルーム側",
            sortOrder: 2,
            mediaIndex: 1,
            pinX: 0.48,
            pinY: 0.52,
            price: 7990,
            linkRelation: "reference",
            linkVerifiedAt: null,
          },
        ],
      },
    },
  });

  const postAlice2 = await prisma.post.create({
    data: {
      title: "リビングの一角",
      description: "",
      category: "living",
      housingType: "rental",
      layoutType: "1ldk",
      roomContextNote: "",
      userId: alice.id,
      medias: { create: [{ path: IMG.living, mood: "warm" }] },
      styleTags: {
        create: [{ tagSlug: "monotone" }, { tagSlug: "ambient_light" }, { tagSlug: "compact" }],
      },
      furnitureItems: {
        create: [
          {
            name: "フロアランプ",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.nitori-net.jp/ec/",
            productHost: "nitori-net.jp",
            note: "",
            sortOrder: 0,
            mediaIndex: 0,
            pinX: 0.28,
            pinY: 0.44,
            price: 8990,
            linkRelation: "same_model",
            linkVerifiedAt: new Date("2025-01-10T00:00:00.000Z"),
          },
        ],
      },
    },
  });

  const postKota1 = await prisma.post.create({
    data: {
      title: "朝のコーヒーと観葉",
      description: "窓際に小さめの棚。豆は近所の店で。",
      category: "oneroom",
      housingType: "rental",
      layoutType: "studio",
      roomContextNote: "角部屋",
      userId: kota.id,
      medias: {
        create: [
          { path: IMG.plants, mood: "plants" },
          { path: IMG.kitchen, mood: "" },
        ],
      },
      styleTags: {
        create: [
          { tagSlug: "coffee" },
          { tagSlug: "plants" },
          { tagSlug: "oneroom" },
          { tagSlug: "budget_mix" },
        ],
      },
      furnitureItems: {
        create: [
          {
            name: "コーヒーミル",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.amazon.co.jp/",
            productHost: "amazon.co.jp",
            note: "",
            sortOrder: 0,
            mediaIndex: 0,
            pinX: 0.52,
            pinY: 0.46,
            price: 12800,
            linkRelation: "purchased",
            linkVerifiedAt: null,
          },
          {
            name: "電気ケトル",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.ikea.com/jp/ja/",
            productHost: "ikea.com",
            note: "キッチン寄りの2枚目",
            sortOrder: 1,
            mediaIndex: 1,
            pinX: 0.45,
            pinY: 0.5,
            price: 3490,
            linkRelation: "purchased",
            linkVerifiedAt: new Date("2024-11-01T00:00:00.000Z"),
          },
        ],
      },
    },
  });

  const postKota2 = await prisma.post.create({
    data: {
      title: "寝室は暗めの壁紙",
      description: "睡眠用に間接だけにしています。",
      category: "bedroom",
      housingType: "rental",
      layoutType: "1k_1dk",
      roomContextNote: "",
      userId: kota.id,
      medias: { create: [{ path: IMG.bedroom, mood: "ambient_light" }] },
      styleTags: {
        create: [{ tagSlug: "mukishitsu" }, { tagSlug: "rental" }, { tagSlug: "mindful" }],
      },
      furnitureItems: {
        create: [],
      },
    },
  });

  const postMina1 = await prisma.post.create({
    data: {
      title: "ワンルーム・物量すくなめ",
      description: "よく使うものだけ。それ以外はしまう。",
      category: "oneroom",
      housingType: "rental",
      layoutType: "studio",
      roomContextNote: "",
      userId: mina.id,
      medias: { create: [{ path: IMG.oneroom, mood: "gray_tone" }] },
      styleTags: {
        create: [
          { tagSlug: "minimalist" },
          { tagSlug: "minimal_volume" },
          { tagSlug: "gray_tone" },
        ],
      },
      furnitureItems: {
        create: [
          {
            name: "収納ボックス",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.ikea.com/jp/ja/",
            productHost: "ikea.com",
            note: "",
            sortOrder: 0,
            mediaIndex: 0,
            pinX: 0.72,
            pinY: 0.55,
            price: 1999,
            linkRelation: "reference",
            linkVerifiedAt: null,
          },
        ],
      },
    },
  });

  const postAlice3 = await prisma.post.create({
    data: {
      title: "キッチンは白ベース",
      description: "調理はコンパクトに。見せる収納は同系色だけにしています。",
      category: "kitchen",
      housingType: "rental",
      layoutType: "1ldk",
      roomContextNote: "",
      userId: alice.id,
      medias: {
        create: [
          { path: IMG.kitchen, mood: "warm" },
          { path: IMG.dining, mood: "ambient_light" },
        ],
      },
      styleTags: {
        create: [
          { tagSlug: "tidying" },
          { tagSlug: "compact" },
          { tagSlug: "rental" },
          { tagSlug: "budget_mix" },
        ],
      },
      furnitureItems: {
        create: [
          {
            name: "キッチンマット",
            brand: "ニトリ",
            brandSlug: "",
            productUrl: "https://www.nitori-net.jp/ec/",
            productHost: "nitori-net.jp",
            note: "1枚目の足元",
            sortOrder: 0,
            mediaIndex: 0,
            pinX: 0.4,
            pinY: 0.78,
            price: 1990,
            linkRelation: "purchased",
            linkVerifiedAt: new Date("2024-08-20T00:00:00.000Z"),
          },
          {
            name: "ダイニングチェア",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.muji.com/jp/ja/store",
            productHost: "muji.com",
            note: "2枚目",
            sortOrder: 1,
            mediaIndex: 1,
            pinX: 0.55,
            pinY: 0.42,
            price: 12900,
            linkRelation: "same_model",
            linkVerifiedAt: null,
          },
        ],
      },
    },
  });

  const postMina2 = await prisma.post.create({
    data: {
      title: "読書用の壁一面",
      description: "電子より紙派。新刊は積まずに読み終えたら出す。",
      category: "study",
      housingType: "rental",
      layoutType: "1k_1dk",
      roomContextNote: "",
      userId: mina.id,
      medias: { create: [{ path: IMG.bookshelf, mood: "ambient_light" }] },
      styleTags: {
        create: [
          { tagSlug: "reading" },
          { tagSlug: "minimalist" },
          { tagSlug: "ambient_light" },
          { tagSlug: "solo_living" },
        ],
      },
      furnitureItems: {
        create: [
          {
            name: "読書灯",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.amazon.co.jp/",
            productHost: "amazon.co.jp",
            note: "",
            sortOrder: 0,
            mediaIndex: 0,
            pinX: 0.33,
            pinY: 0.4,
            price: 4980,
            linkRelation: "purchased",
            linkVerifiedAt: new Date("2025-02-01T00:00:00.000Z"),
          },
        ],
      },
    },
  });

  const postRen1 = await prisma.post.create({
    data: {
      title: "週末のダイニング",
      description: "友人が来るときはこのテーブルを中心に。平日は片付けて広く。",
      category: "dining",
      housingType: "rental",
      layoutType: "2ldk",
      roomContextNote: "",
      userId: ren.id,
      medias: { create: [{ path: IMG.dining, mood: "warm" }] },
      styleTags: {
        create: [
          { tagSlug: "warm" },
          { tagSlug: "solo_living" },
          { tagSlug: "nakameguro" },
          { tagSlug: "budget_retail" },
        ],
      },
      furnitureItems: {
        create: [
          {
            name: "ダイニングテーブル",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.ikea.com/jp/ja/",
            productHost: "ikea.com",
            note: "",
            sortOrder: 0,
            mediaIndex: 0,
            pinX: 0.5,
            pinY: 0.48,
            price: 34990,
            linkRelation: "purchased",
            linkVerifiedAt: new Date("2024-05-01T00:00:00.000Z"),
          },
        ],
      },
    },
  });

  const postRen2 = await prisma.post.create({
    data: {
      title: "玄関からリビングへの動線",
      description: "靴箱はスリム型。鏡で奥行きを補っています。",
      category: "entrance",
      housingType: "rental",
      layoutType: "2ldk",
      roomContextNote: "",
      userId: ren.id,
      medias: { create: [{ path: IMG.hallway, mood: "concrete" }] },
      styleTags: {
        create: [
          { tagSlug: "compact" },
          { tagSlug: "mukishitsu" },
          { tagSlug: "rental" },
          { tagSlug: "tidying" },
        ],
      },
      furnitureItems: {
        create: [
          {
            name: "壁掛けミラー",
            brand: "",
            brandSlug: "",
            productUrl: "https://www.nitori-net.jp/ec/",
            productHost: "nitori-net.jp",
            note: "",
            sortOrder: 0,
            mediaIndex: 0,
            pinX: 0.62,
            pinY: 0.35,
            price: 5990,
            linkRelation: "reference",
            linkVerifiedAt: null,
          },
        ],
      },
    },
  });

  await prisma.like.createMany({
    data: [
      { userId: alice.id, postId: postKota1.id },
      { userId: kota.id, postId: postAlice1.id },
      { userId: mina.id, postId: postAlice2.id },
      { userId: ren.id, postId: postAlice1.id },
      { userId: ren.id, postId: postMina2.id },
      { userId: alice.id, postId: postRen1.id },
      { userId: kota.id, postId: postRen2.id },
      { userId: mina.id, postId: postAlice3.id },
      { userId: kota.id, postId: postMina2.id },
    ],
  });

  await prisma.bookmark.createMany({
    data: [
      { userId: mina.id, postId: postAlice1.id },
      { userId: alice.id, postId: postMina1.id },
      { userId: kota.id, postId: postAlice3.id },
      { userId: mina.id, postId: postRen1.id },
      { userId: ren.id, postId: postKota2.id },
    ],
  });

  const kotaMill = await prisma.furnitureItem.findFirst({
    where: { postId: postKota1.id, name: "コーヒーミル" },
    select: { productUrl: true },
  });
  if (kotaMill) {
    await prisma.itemWishlist.create({
      data: {
        userId: alice.id,
        name: "コーヒーミル",
        productUrl: kotaMill.productUrl,
        note: "キッチンに置きたい",
        sourcePostId: postKota1.id,
        price: 12800,
        buyRank: 1,
      },
    });
  }

  const minaReadingLamp = await prisma.furnitureItem.findFirst({
    where: { postId: postMina2.id, name: "読書灯" },
    select: { productUrl: true },
  });
  if (minaReadingLamp) {
    await prisma.itemWishlist.create({
      data: {
        userId: kota.id,
        name: "読書灯",
        productUrl: minaReadingLamp.productUrl,
        note: "寝室のサイドに",
        sourcePostId: postMina2.id,
        price: 4980,
        buyRank: 2,
      },
    });
  }

  console.log("Seed OK:", {
    users: [alice.email, kota.email, mina.email, ren.email],
    posts: [
      postAlice1.id,
      postAlice2.id,
      postAlice3.id,
      postKota1.id,
      postKota2.id,
      postMina1.id,
      postMina2.id,
      postRen1.id,
      postRen2.id,
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
