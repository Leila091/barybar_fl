import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    listingId: number;

    @Column()
    userId: number;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column({ default: "active" })
    status: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;
}